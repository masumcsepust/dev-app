using Microsoft.EntityFrameworkCore;
using PharmacyService.Data;
using PharmacyService.DTOs;
using PharmacyService.Models;

namespace PharmacyService.Services;

public interface ICategoryService
{
    Task<List<MedicineCategory>> GetAllAsync();
    Task<MedicineCategory?> GetByIdAsync(int id);
    Task<MedicineCategory> CreateAsync(CreateCategoryDto dto);
    Task<MedicineCategory?> UpdateAsync(int id, UpdateCategoryDto dto);
    Task<bool> DeleteAsync(int id);
}

public class CategoryService : ICategoryService
{
    private readonly PharmacyDbContext _db;
    public CategoryService(PharmacyDbContext db) => _db = db;

    public async Task<List<MedicineCategory>> GetAllAsync() =>
        await _db.MedicineCategories.AsNoTracking().ToListAsync();

    public async Task<MedicineCategory?> GetByIdAsync(int id) =>
        await _db.MedicineCategories.Include(c => c.Medicines).AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);

    public async Task<MedicineCategory> CreateAsync(CreateCategoryDto dto)
    {
        var cat = new MedicineCategory { Name = dto.Name, Description = dto.Description };
        _db.MedicineCategories.Add(cat);
        await _db.SaveChangesAsync();
        return cat;
    }

    public async Task<MedicineCategory?> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var cat = await _db.MedicineCategories.FindAsync(id);
        if (cat == null) return null;
        cat.Name = dto.Name;
        cat.Description = dto.Description;
        await _db.SaveChangesAsync();
        return cat;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var cat = await _db.MedicineCategories.FindAsync(id);
        if (cat == null) return false;
        _db.MedicineCategories.Remove(cat);
        await _db.SaveChangesAsync();
        return true;
    }
}
