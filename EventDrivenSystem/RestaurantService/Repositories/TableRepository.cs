using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.Models;

namespace RestaurantService.Repositories;

public interface ITableRepository
{
    Task<IEnumerable<RestaurantTable>> GetByRestaurantAsync(int restaurantId);
    Task<RestaurantTable?> GetByIdAsync(int id);
    Task<RestaurantTable> AddAsync(RestaurantTable table);
    Task<RestaurantTable> UpdateAsync(RestaurantTable table);
    Task<bool> DeleteAsync(int id);
}

public class TableRepository : ITableRepository
{
    private readonly RestaurantDbContext _context;

    public TableRepository(RestaurantDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RestaurantTable>> GetByRestaurantAsync(int restaurantId)
    {
        return await _context.RestaurantTables
            .Where(t => t.RestaurantId == restaurantId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<RestaurantTable?> GetByIdAsync(int id)
    {
        return await _context.RestaurantTables.FindAsync(id);
    }

    public async Task<RestaurantTable> AddAsync(RestaurantTable table)
    {
        table.CreatedAt = DateTime.UtcNow;
        table.UpdatedAt = DateTime.UtcNow;

        _context.RestaurantTables.Add(table);
        await _context.SaveChangesAsync();
        return table;
    }

    public async Task<RestaurantTable> UpdateAsync(RestaurantTable table)
    {
        table.UpdatedAt = DateTime.UtcNow;
        _context.RestaurantTables.Update(table);
        await _context.SaveChangesAsync();
        return table;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var table = await _context.RestaurantTables.FindAsync(id);
        if (table == null) return false;

        _context.RestaurantTables.Remove(table);
        await _context.SaveChangesAsync();
        return true;
    }
}
