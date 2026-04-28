namespace PharmacyService.Models;

public enum MedicineForm { Tablet, Capsule, Syrup, Injection, Cream, Drops, Inhaler, Other }

public class Medicine
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string GenericName { get; set; } = string.Empty;
    public string Manufacturer { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SideEffects { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public MedicineForm Form { get; set; } = MedicineForm.Tablet;
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public bool RequiresPrescription { get; set; }
    public bool IsAvailable { get; set; } = true;
    public string ImageUrl { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public MedicineCategory? Category { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
