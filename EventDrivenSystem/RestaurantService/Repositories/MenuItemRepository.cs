using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.Models;

namespace RestaurantService.Repositories;

public interface IMenuItemRepository
{
    Task<IEnumerable<MenuItem>> GetByRestaurantAsync(int restaurantId);
    Task<MenuItem?> GetByIdAsync(int id);
    Task<MenuItem> AddAsync(MenuItem item);
    Task<MenuItem> UpdateAsync(MenuItem item);
    Task<bool> DeleteAsync(int id);
}

public class MenuItemRepository : IMenuItemRepository
{
    private readonly RestaurantDbContext _context;

    public MenuItemRepository(RestaurantDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MenuItem>> GetByRestaurantAsync(int restaurantId)
    {
        return await _context.MenuItems
            .Where(m => m.RestaurantId == restaurantId)
            .Include(m => m.Category)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<MenuItem?> GetByIdAsync(int id)
    {
        return await _context.MenuItems.FindAsync(id);
    }

    public async Task<MenuItem> AddAsync(MenuItem item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        _context.MenuItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<MenuItem> UpdateAsync(MenuItem item)
    {
        item.UpdatedAt = DateTime.UtcNow;
        _context.MenuItems.Update(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var item = await _context.MenuItems.FindAsync(id);
        if (item == null) return false;

        _context.MenuItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }
}
