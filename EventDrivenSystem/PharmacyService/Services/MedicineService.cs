using Microsoft.EntityFrameworkCore;
using PharmacyService.Data;
using PharmacyService.DTOs;
using PharmacyService.Models;

namespace PharmacyService.Services;

public interface IMedicineService
{
    Task<List<Medicine>> GetAllAsync(int? categoryId, bool? requiresPrescription, string? search);
    Task<Medicine?> GetByIdAsync(int id);
    Task<Medicine> CreateAsync(CreateMedicineDto dto);
    Task<Medicine?> UpdateAsync(int id, UpdateMedicineDto dto);
    Task<bool> DeleteAsync(int id);
    Task<string> UploadImageAsync(IFormFile file, string rootPath);
    Task<bool> DeductStockAsync(List<(int MedicineId, int Quantity)> items);
}

public class MedicineService : IMedicineService
{
    private readonly PharmacyDbContext _db;
    public MedicineService(PharmacyDbContext db) => _db = db;

    public async Task<List<Medicine>> GetAllAsync(int? categoryId, bool? requiresPrescription, string? search)
    {
        var query = _db.Medicines.Include(m => m.Category).AsQueryable();
        if (categoryId.HasValue) query = query.Where(m => m.CategoryId == categoryId);
        if (requiresPrescription.HasValue) query = query.Where(m => m.RequiresPrescription == requiresPrescription);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(m => m.Name.Contains(search) || m.GenericName.Contains(search) || m.Manufacturer.Contains(search));
        return await query.AsNoTracking().ToListAsync();
    }

    public async Task<Medicine?> GetByIdAsync(int id) =>
        await _db.Medicines.Include(m => m.Category).AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);

    public async Task<Medicine> CreateAsync(CreateMedicineDto dto)
    {
        if (!Enum.TryParse<MedicineForm>(dto.Form, true, out var form))
            throw new InvalidOperationException($"Invalid medicine form: {dto.Form}");

        var medicine = new Medicine
        {
            Name = dto.Name, GenericName = dto.GenericName, Manufacturer = dto.Manufacturer,
            Description = dto.Description, SideEffects = dto.SideEffects, Dosage = dto.Dosage,
            Form = form, Price = dto.Price, StockQuantity = dto.StockQuantity,
            RequiresPrescription = dto.RequiresPrescription, IsAvailable = dto.IsAvailable,
            ImageUrl = dto.ImageUrl, CategoryId = dto.CategoryId,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };
        _db.Medicines.Add(medicine);
        await _db.SaveChangesAsync();
        return medicine;
    }

    public async Task<Medicine?> UpdateAsync(int id, UpdateMedicineDto dto)
    {
        var medicine = await _db.Medicines.FindAsync(id);
        if (medicine == null) return null;
        if (!Enum.TryParse<MedicineForm>(dto.Form, true, out var form))
            throw new InvalidOperationException($"Invalid medicine form: {dto.Form}");

        medicine.Name = dto.Name; medicine.GenericName = dto.GenericName; medicine.Manufacturer = dto.Manufacturer;
        medicine.Description = dto.Description; medicine.SideEffects = dto.SideEffects; medicine.Dosage = dto.Dosage;
        medicine.Form = form; medicine.Price = dto.Price; medicine.StockQuantity = dto.StockQuantity;
        medicine.RequiresPrescription = dto.RequiresPrescription; medicine.IsAvailable = dto.IsAvailable;
        medicine.ImageUrl = dto.ImageUrl; medicine.CategoryId = dto.CategoryId;
        medicine.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return medicine;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var medicine = await _db.Medicines.FindAsync(id);
        if (medicine == null) return false;
        _db.Medicines.Remove(medicine);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string rootPath)
    {
        var dir = Path.Combine(rootPath, "uploads", "medicines");
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        using var stream = new FileStream(Path.Combine(dir, fileName), FileMode.Create);
        await file.CopyToAsync(stream);
        return $"/uploads/medicines/{fileName}";
    }

    public async Task<bool> DeductStockAsync(List<(int MedicineId, int Quantity)> items)
    {
        foreach (var (medicineId, quantity) in items)
        {
            var medicine = await _db.Medicines.FindAsync(medicineId);
            if (medicine == null) continue;
            medicine.StockQuantity = Math.Max(0, medicine.StockQuantity - quantity);
            medicine.UpdatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync();
        return true;
    }
}
