using RestaurantService.Data;
using RestaurantService.DTOs;
using RestaurantService.Models;
using RestaurantService.Repositories;

namespace RestaurantService.Services;

public interface IMenuItemService
{
    Task<IEnumerable<MenuItem>> GetMenuItemsAsync(int restaurantId);
    Task<MenuItem?> GetMenuItemAsync(int menuItemId);
    Task<MenuItem> CreateMenuItemAsync(CreateMenuItemDto dto);
    Task<MenuItem?> UpdateMenuItemAsync(int menuItemId, UpdateMenuItemDto dto);
    Task<bool> DeleteMenuItemAsync(int menuItemId);
}

public class MenuItemService : IMenuItemService
{
    private readonly IMenuItemRepository _repository;
    private readonly RestaurantDbContext _context;

    public MenuItemService(IMenuItemRepository repository, RestaurantDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public Task<IEnumerable<MenuItem>> GetMenuItemsAsync(int restaurantId)
    {
        return _repository.GetByRestaurantAsync(restaurantId);
    }

    public Task<MenuItem?> GetMenuItemAsync(int menuItemId)
    {
        return _repository.GetByIdAsync(menuItemId);
    }

    public async Task<MenuItem> CreateMenuItemAsync(CreateMenuItemDto dto)
    {
        var restaurant = await _context.Restaurants.FindAsync(dto.RestaurantId);
        if (restaurant == null)
            throw new KeyNotFoundException("Restaurant not found.");

        if (dto.CategoryId.HasValue)
        {
            var category = await _context.FoodCategories.FindAsync(dto.CategoryId.Value);
            if (category == null || category.RestaurantId != dto.RestaurantId)
                throw new InvalidOperationException("Food category does not belong to the selected restaurant.");
        }

        var item = new MenuItem
        {
            RestaurantId = dto.RestaurantId,
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            ImageUrl = dto.ImageUrl,
            IsAvailable = dto.IsAvailable
        };

        return await _repository.AddAsync(item);
    }

    public async Task<MenuItem?> UpdateMenuItemAsync(int menuItemId, UpdateMenuItemDto dto)
    {
        var item = await _repository.GetByIdAsync(menuItemId);
        if (item == null) return null;

        if (dto.CategoryId.HasValue)
        {
            var category = await _context.FoodCategories.FindAsync(dto.CategoryId.Value);
            if (category == null || category.RestaurantId != dto.RestaurantId)
                throw new InvalidOperationException("Food category does not belong to the selected restaurant.");
        }

        item.RestaurantId = dto.RestaurantId;
        item.CategoryId = dto.CategoryId;
        item.Name = dto.Name;
        item.Description = dto.Description;
        item.Price = dto.Price;
        item.ImageUrl = dto.ImageUrl;
        item.IsAvailable = dto.IsAvailable;

        return await _repository.UpdateAsync(item);
    }

    public Task<bool> DeleteMenuItemAsync(int menuItemId)
    {
        return _repository.DeleteAsync(menuItemId);
    }
}
