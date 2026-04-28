using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PharmacyService.Data;

namespace PharmacyService.Services;

public record ChatMessage(string Role, string Content);

public interface IPharmaAiChatService
{
    Task<string> ChatAsync(List<ChatMessage> messages, string language = "en");
}

public class PharmaAiChatService : IPharmaAiChatService
{
    private readonly PharmacyDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public PharmaAiChatService(PharmacyDbContext db, IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    public async Task<string> ChatAsync(List<ChatMessage> messages, string language = "en")
    {
        var systemPrompt = await BuildSystemPromptAsync();

        string reply;
        if (_config.GetValue<bool>("Ollama:Enabled"))
            reply = await ChatWithOllamaAsync(systemPrompt, messages);
        else
            reply = await ChatWithAnthropicAsync(systemPrompt, messages);

        // Translate to Bangla using a second Ollama call
        if (language == "bn" && _config.GetValue<bool>("Ollama:Enabled"))
            reply = await TranslateToBanglaAsync(reply);

        return reply;
    }

    // ── Ollama ────────────────────────────────────────────────────────────────

    private async Task<string> ChatWithOllamaAsync(string systemPrompt, List<ChatMessage> messages)
    {
        var baseUrl = _config["Ollama:BaseUrl"] ?? "http://localhost:11434";
        var model = _config["Ollama:Model"] ?? "cniongolo/biomistral";

        var ollamaMessages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };

        foreach (var m in messages.SkipWhile(m => string.Equals(m.Role, "assistant", StringComparison.OrdinalIgnoreCase)))
            ollamaMessages.Add(new { role = m.Role.ToLower(), content = m.Content });

        var reply = await CallOllamaAsync(baseUrl, model, ollamaMessages);
        return reply;
    }

    private async Task<string> TranslateToBanglaAsync(string englishText)
    {
        var baseUrl = _config["Ollama:BaseUrl"] ?? "http://localhost:11434";
        var model = _config["Ollama:Model"] ?? "cniongolo/biomistral";

        var messages = new List<object>
        {
            new { role = "system", content = "You are a professional translator. Translate the given English text to Bengali (বাংলা). Output ONLY the Bengali translation, nothing else. Do not add explanations or comments." },
            new { role = "user", content = $"Translate this to Bengali:\n\n{englishText}" }
        };

        return await CallOllamaAsync(baseUrl, model, messages);
    }

    private async Task<string> CallOllamaAsync(string baseUrl, string model, List<object> messages)
    {
        var requestBody = new { model, messages, stream = false };

        var client = _httpClientFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(120);

        var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/api/chat");
        request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Ollama error {(int)response.StatusCode}: {err}");
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("message").GetProperty("content").GetString() ?? string.Empty;
    }

    // ── Anthropic ─────────────────────────────────────────────────────────────

    private async Task<string> ChatWithAnthropicAsync(string systemPrompt, List<ChatMessage> messages)
    {
        var apiKey = _config["Anthropic:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("No AI provider configured. Enable Ollama or set Anthropic:ApiKey.");

        var apiMessages = messages
            .SkipWhile(m => string.Equals(m.Role, "assistant", StringComparison.OrdinalIgnoreCase))
            .Select(m => new { role = m.Role.ToLower(), content = m.Content })
            .ToList();

        var requestBody = new
        {
            model = "claude-haiku-4-5-20251001",
            max_tokens = 1024,
            system = systemPrompt,
            messages = apiMessages
        };

        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
        request.Headers.Add("x-api-key", apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Anthropic API error {(int)response.StatusCode}: {err}");
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("content")[0].GetProperty("text").GetString() ?? string.Empty;
    }

    // ── System Prompt ─────────────────────────────────────────────────────────

    private async Task<string> BuildSystemPromptAsync()
    {
        var categories = await _db.MedicineCategories.AsNoTracking().ToListAsync();
        var medicines = await _db.Medicines.Include(m => m.Category).AsNoTracking().ToListAsync();
        var recentOrderCount = await _db.Orders.CountAsync(o => o.CreatedAt >= DateTime.UtcNow.AddDays(-7));

        var sb = new StringBuilder();
        sb.AppendLine("You are PharmaAI, a knowledgeable and helpful pharmacy assistant for a digital pharmacy platform.");
        sb.AppendLine("Help customers find the right medicines, understand dosages, side effects, and stock availability.");
        sb.AppendLine("Always emphasize that this information is educational — customers should consult a licensed pharmacist or doctor for medical advice.");
        sb.AppendLine("For prescription-only medicines (marked [Rx]), always direct customers to submit a prescription through the 'Submit Prescription' page.");
        sb.AppendLine("Be warm, professional, and clear. Keep answers concise.");
        sb.AppendLine($"Today is {DateTime.UtcNow:dddd, MMMM d, yyyy}.");
        sb.AppendLine();
        sb.AppendLine("=== PHARMACY CATALOG ===");

        foreach (var cat in categories)
        {
            var catMeds = medicines.Where(m => m.CategoryId == cat.Id && m.IsAvailable).ToList();
            if (!catMeds.Any()) continue;
            sb.AppendLine();
            sb.AppendLine($"[{cat.Name}] — {cat.Description}");
            foreach (var med in catMeds)
            {
                var rx = med.RequiresPrescription ? " [Rx]" : "";
                sb.AppendLine($"  - {med.Name} ({med.GenericName}) | {med.Form} | {med.Price:0.##} BDT | Stock: {med.StockQuantity}{rx}");
                if (!string.IsNullOrWhiteSpace(med.Dosage)) sb.AppendLine($"    Dosage: {med.Dosage}");
                if (!string.IsNullOrWhiteSpace(med.SideEffects)) sb.AppendLine($"    Side effects: {med.SideEffects}");
            }
        }

        var other = medicines.Where(m => m.CategoryId == null && m.IsAvailable).ToList();
        if (other.Any())
        {
            sb.AppendLine(); sb.AppendLine("[Other]");
            foreach (var med in other)
            {
                var rx = med.RequiresPrescription ? " [Rx]" : "";
                sb.AppendLine($"  - {med.Name} ({med.GenericName}) | {med.Form} | {med.Price:0.##} BDT | Stock: {med.StockQuantity}{rx}");
            }
        }

        sb.AppendLine();
        sb.AppendLine($"Orders placed in the last 7 days: {recentOrderCount}");
        sb.AppendLine("=== END CATALOG ===");
        return sb.ToString();
    }
}
