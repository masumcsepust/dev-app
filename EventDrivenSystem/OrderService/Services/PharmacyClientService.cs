using System.Text.Json;

namespace OrderService.Services;

public record MedicineInfo(int Id, string Name, decimal Price, int StockQuantity, bool IsAvailable);
public record DeductStockItem(int MedicineId, int Quantity);

public interface IPharmacyClientService
{
    Task<MedicineInfo?> GetMedicineAsync(int id);
    Task DeductStockAsync(List<DeductStockItem> items);
}

public class PharmacyClientService : IPharmacyClientService
{
    private readonly HttpClient _http;
    private readonly ILogger<PharmacyClientService> _logger;
    private static readonly JsonSerializerOptions _json = new() { PropertyNameCaseInsensitive = true };

    public PharmacyClientService(HttpClient http, ILogger<PharmacyClientService> logger)
    {
        _http = http;
        _logger = logger;
    }

    public async Task<MedicineInfo?> GetMedicineAsync(int id)
    {
        var response = await _http.GetAsync($"api/medicines/{id}");
        if (!response.IsSuccessStatusCode) return null;
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<MedicineInfo>(json, _json);
    }

    public async Task DeductStockAsync(List<DeductStockItem> items)
    {
        var response = await _http.PostAsJsonAsync("api/medicines/deduct-stock", items);
        if (!response.IsSuccessStatusCode)
            _logger.LogWarning("Stock deduction returned {Status}", response.StatusCode);
    }
}
