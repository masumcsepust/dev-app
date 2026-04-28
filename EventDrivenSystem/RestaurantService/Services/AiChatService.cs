using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.Models;

namespace RestaurantService.Services;

public record ChatMessage(string Role, string Content);

public interface IAiChatService
{
    Task<string> ChatAsync(List<ChatMessage> messages);
}

public class AiChatService : IAiChatService
{
    private readonly RestaurantDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public AiChatService(RestaurantDbContext db, IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    public async Task<string> ChatAsync(List<ChatMessage> messages)
    {
        var systemPrompt = await BuildSystemPromptAsync();
        var apiKey = _config["Anthropic:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            throw new InvalidOperationException("Anthropic API key is not configured. Set Anthropic:ApiKey in appsettings.");

        // Anthropic requires the first message to be from 'user' — drop any leading assistant turns
        // (the frontend includes a synthetic welcome message at index 0)
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
        request.Content = new StringContent(
            JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

        var response = await client.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Anthropic API error {(int)response.StatusCode}: {errorBody}");
        }

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return doc.RootElement.GetProperty("content")[0].GetProperty("text").GetString() ?? string.Empty;
    }

    private async Task<string> BuildSystemPromptAsync()
    {
        var restaurants = await _db.Restaurants
            .Include(r => r.Categories)
            .Include(r => r.MenuItems)
            .Include(r => r.Tables)
            .AsNoTracking()
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("You are DeshiFood AI, a helpful assistant for a Bangladeshi restaurant platform.");
        sb.AppendLine("Help customers find food they'll love, answer questions about menus, and assist with reservations.");
        sb.AppendLine("Be warm, friendly, and knowledgeable about Bangladeshi cuisine. Keep answers concise and helpful.");
        sb.AppendLine($"Today is {DateTime.UtcNow:dddd, MMMM d, yyyy}.");
        sb.AppendLine();
        sb.AppendLine("When a customer wants to book a table, direct them to visit the restaurant page and click 'Book a Table'.");
        sb.AppendLine();
        sb.AppendLine("=== AVAILABLE RESTAURANTS ===");

        foreach (var r in restaurants)
        {
            sb.AppendLine();
            sb.AppendLine($"Restaurant: {r.Name} (ID: {r.Id})");
            sb.AppendLine($"  Cuisine: {r.Cuisine}");
            sb.AppendLine($"  Address: {r.Address}");
            sb.AppendLine($"  About: {r.Description}");

            var availableTables = r.Tables.Count(t => t.Status == TableStatus.Available);
            sb.AppendLine($"  Tables: {r.Tables.Count} total, {availableTables} currently available");

            var availableItems = r.MenuItems.Where(m => m.IsAvailable).ToList();
            if (availableItems.Any())
            {
                sb.AppendLine("  Menu Items:");
                foreach (var cat in r.Categories)
                {
                    var items = availableItems.Where(m => m.CategoryId == cat.Id).ToList();
                    if (!items.Any()) continue;
                    sb.AppendLine($"    [{cat.Name}]");
                    foreach (var item in items)
                        sb.AppendLine($"      - {item.Name}: {item.Description} (Price: {item.Price:0.##} BDT)");
                }
                var uncategorized = availableItems.Where(m => m.CategoryId == null).ToList();
                if (uncategorized.Any())
                {
                    sb.AppendLine("    [Other]");
                    foreach (var item in uncategorized)
                        sb.AppendLine($"      - {item.Name}: {item.Description} (Price: {item.Price:0.##} BDT)");
                }
            }
        }

        sb.AppendLine();
        sb.AppendLine("=== END OF RESTAURANT DATA ===");

        return sb.ToString();
    }
}
