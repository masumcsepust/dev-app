namespace PharmacyService.Models;

public enum PrescriptionStatus { Pending, Approved, Dispensed, Rejected }

public class Prescription
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public PrescriptionStatus Status { get; set; } = PrescriptionStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<PrescriptionItem> Items { get; set; } = new();
}

public class PrescriptionItem
{
    public int Id { get; set; }
    public int PrescriptionId { get; set; }
    public Prescription Prescription { get; set; } = null!;
    public int MedicineId { get; set; }
    public Medicine Medicine { get; set; } = null!;
    public int Quantity { get; set; }
}
