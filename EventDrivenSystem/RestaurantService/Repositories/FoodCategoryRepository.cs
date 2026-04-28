using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.Models;

namespace RestaurantService.Repositories;

public interface IFoodCategoryRepository
{
    Task<IEnumerable<FoodCategory>> GetByRestaurantAsync(int restaurantId);
    Task<FoodCategory?> GetByIdAsync(int id);
    Task<FoodCategory> AddAsync(FoodCategory category);
    Task<FoodCategory> UpdateAsync(FoodCategory category);
    Task<bool> DeleteAsync(int id);
}

public class FoodCategoryRepository : IFoodCategoryRepository
{
    private readonly RestaurantDbContext _context;

    public FoodCategoryRepository(RestaurantDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FoodCategory>> GetByRestaurantAsync(int restaurantId)
    {
        return await _context.FoodCategories
            .Where(c => c.RestaurantId == restaurantId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<FoodCategory?> GetByIdAsync(int id)
    {
        return await _context.FoodCategories.FindAsync(id);
    }

    public async Task<FoodCategory> AddAsync(FoodCategory category)
    {
        category.CreatedAt = DateTime.UtcNow;
        category.UpdatedAt = DateTime.UtcNow;

        _context.FoodCategories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<FoodCategory> UpdateAsync(FoodCategory category)
    {
        category.UpdatedAt = DateTime.UtcNow;
        _context.FoodCategories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _context.FoodCategories.FindAsync(id);
        if (category == null) return false;

        _context.FoodCategories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }
}
