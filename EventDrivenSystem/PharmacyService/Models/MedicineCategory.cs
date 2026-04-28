namespace PharmacyService.Models;

public class MedicineCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<Medicine> Medicines { get; set; } = new();
}
