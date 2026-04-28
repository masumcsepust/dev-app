using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.DTOs;
using RestaurantService.Models;
using RestaurantService.Repositories;

namespace RestaurantService.Services;

public interface ITableService
{
    Task<IEnumerable<RestaurantTable>> GetTablesAsync(int restaurantId);
    Task<RestaurantTable?> GetTableAsync(int tableId);
    Task<RestaurantTable> CreateTableAsync(CreateTableDto dto);
    Task<RestaurantTable?> UpdateTableAsync(int tableId, UpdateTableDto dto);
    Task<bool> DeleteTableAsync(int tableId);
}

public class TableService : ITableService
{
    private readonly ITableRepository _repository;
    private readonly RestaurantDbContext _context;

    public TableService(ITableRepository repository, RestaurantDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public Task<IEnumerable<RestaurantTable>> GetTablesAsync(int restaurantId)
    {
        return _repository.GetByRestaurantAsync(restaurantId);
    }

    public Task<RestaurantTable?> GetTableAsync(int tableId)
    {
        return _repository.GetByIdAsync(tableId);
    }

    public async Task<RestaurantTable> CreateTableAsync(CreateTableDto dto)
    {
        var restaurant = await _context.Restaurants.FindAsync(dto.RestaurantId);
        if (restaurant == null)
            throw new KeyNotFoundException("Restaurant not found.");

        var table = new RestaurantTable
        {
            RestaurantId = dto.RestaurantId,
            TableNumber = dto.TableNumber,
            SeatingCapacity = dto.SeatingCapacity,
            Status = dto.Status,
            Area = dto.Area
        };

        return await _repository.AddAsync(table);
    }

    public async Task<RestaurantTable?> UpdateTableAsync(int tableId, UpdateTableDto dto)
    {
        var table = await _repository.GetByIdAsync(tableId);
        if (table == null) return null;

        table.TableNumber = dto.TableNumber;
        table.SeatingCapacity = dto.SeatingCapacity;
        table.Status = dto.Status;
        table.Area = dto.Area;

        return await _repository.UpdateAsync(table);
    }

    public Task<bool> DeleteTableAsync(int tableId)
    {
        return _repository.DeleteAsync(tableId);
    }
}
