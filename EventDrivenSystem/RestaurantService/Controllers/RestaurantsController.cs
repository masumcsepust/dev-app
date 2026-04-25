using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.DTOs;
using RestaurantService.Events;
using RestaurantService.Messaging;
using RestaurantService.Models;

namespace RestaurantService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantsController : ControllerBase
    {
        private readonly RestaurantDbContext _context;
        private readonly IMessagePublisher _messagePublisher;

        public RestaurantsController(RestaurantDbContext context, IMessagePublisher messagePublisher)
        {
            _context = context;
            _messagePublisher = messagePublisher;
        }

        [HttpGet]
        public async Task<IActionResult> GetRestaurants()
        {
            var restaurants = await _context.Restaurants.ToListAsync();
            return Ok(restaurants);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetRestaurant(int id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null) return NotFound();
            return Ok(restaurant);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRestaurant([FromBody] CreateRestaurantDto dto)
        {
            var owner = await _context.Users.FindAsync(dto.OwnerId);
            if (owner == null || owner.UserType != "CMS")
                return BadRequest("Invalid Owner or Owner is not CMS role.");

            var restaurant = new Restaurant
            {
                Name = dto.Name,
                Description = dto.Description,
                Address = dto.Address,
                OwnerId = dto.OwnerId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Restaurants.Add(restaurant);
            await _context.SaveChangesAsync();

            // Publish event
            await _messagePublisher.PublishEventAsync(new RestaurantEvent
            {
                RestaurantId = restaurant.Id,
                Name = restaurant.Name,
                Description = restaurant.Description,
                OwnerId = restaurant.OwnerId,
                EventType = "Created"
            }, "restaurant.created");

            return CreatedAtAction(nameof(GetRestaurant), new { id = restaurant.Id }, restaurant);
        }

        [HttpGet("{restaurantId}/menu")]
        public async Task<IActionResult> GetMenu(int restaurantId)
        {
            var menu = await _context.MenuItems.Where(m => m.RestaurantId == restaurantId).ToListAsync();
            return Ok(menu);
        }

        [HttpPost("{restaurantId}/menu")]
        public async Task<IActionResult> AddMenuItem(int restaurantId, [FromBody] CreateMenuItemDto dto)
        {
            if (restaurantId != dto.RestaurantId) return BadRequest();

            var restaurant = await _context.Restaurants.FindAsync(restaurantId);
            if (restaurant == null) return NotFound("Restaurant not found");

            var menuItem = new MenuItem
            {
                RestaurantId = dto.RestaurantId,
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                IsAvailable = dto.IsAvailable,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.MenuItems.Add(menuItem);
            await _context.SaveChangesAsync();

            // Publish event
            await _messagePublisher.PublishEventAsync(new MenuEvent
            {
                MenuItemId = menuItem.Id,
                RestaurantId = menuItem.RestaurantId,
                Name = menuItem.Name,
                Price = menuItem.Price,
                IsAvailable = menuItem.IsAvailable,
                EventType = "MenuUpdated"
            }, "menu.updated");

            return Ok(menuItem);
        }
    }
}
