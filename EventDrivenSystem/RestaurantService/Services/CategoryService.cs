using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.DTOs;
using RestaurantService.Models;
using RestaurantService.Repositories;

namespace RestaurantService.Services;

public interface ICategoryService
{
    Task<IEnumerable<FoodCategory>> GetCategoriesAsync(int restaurantId);
    Task<FoodCategory?> GetCategoryAsync(int categoryId);
    Task<FoodCategory> CreateCategoryAsync(CreateFoodCategoryDto dto);
    Task<FoodCategory?> UpdateCategoryAsync(int categoryId, UpdateFoodCategoryDto dto);
    Task<bool> DeleteCategoryAsync(int categoryId);
}

public class CategoryService : ICategoryService
{
    private readonly IFoodCategoryRepository _repository;
    private readonly RestaurantDbContext _context;

    public CategoryService(IFoodCategoryRepository repository, RestaurantDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public Task<IEnumerable<FoodCategory>> GetCategoriesAsync(int restaurantId)
    {
        return _repository.GetByRestaurantAsync(restaurantId);
    }

    public Task<FoodCategory?> GetCategoryAsync(int categoryId)
    {
        return _repository.GetByIdAsync(categoryId);
    }

    public async Task<FoodCategory> CreateCategoryAsync(CreateFoodCategoryDto dto)
    {
        var restaurant = await _context.Restaurants.FindAsync(dto.RestaurantId);
        if (restaurant == null)
            throw new KeyNotFoundException("Restaurant not found.");

        var exists = await _context.FoodCategories
            .AnyAsync(c => c.RestaurantId == dto.RestaurantId && c.Name == dto.Name);
        if (exists)
            throw new InvalidOperationException($"Category '{dto.Name}' already exists for this restaurant.");

        var category = new FoodCategory
        {
            RestaurantId = dto.RestaurantId,
            Name = dto.Name,
            Description = dto.Description
        };

        return await _repository.AddAsync(category);
    }

    public async Task<FoodCategory?> UpdateCategoryAsync(int categoryId, UpdateFoodCategoryDto dto)
    {
        var category = await _repository.GetByIdAsync(categoryId);
        if (category == null) return null;

        var exists = await _context.FoodCategories
            .AnyAsync(c => c.RestaurantId == category.RestaurantId && c.Name == dto.Name && c.Id != categoryId);
        if (exists)
            throw new InvalidOperationException($"Category '{dto.Name}' already exists for this restaurant.");

        category.Name = dto.Name;
        category.Description = dto.Description;

        return await _repository.UpdateAsync(category);
    }

    public Task<bool> DeleteCategoryAsync(int categoryId)
    {
        return _repository.DeleteAsync(categoryId);
    }
}
