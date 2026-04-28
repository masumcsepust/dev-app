using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.DTOs;
using RestaurantService.Models;
using RestaurantService.Events;
using RestaurantService.Messaging;

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

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateRestaurant([FromBody] CreateRestaurantDto dto)
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            if (role != "CMS")
                return Forbid();

            var ownerIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(ownerIdClaim, out var ownerId))
                return Unauthorized();

            var restaurant = new Restaurant
            {
                Name = dto.Name,
                Cuisine = dto.Cuisine ?? string.Empty,
                ImageUrl = dto.ImageUrl ?? string.Empty,
                Description = dto.Description ?? string.Empty,
                Address = dto.Address,
                OwnerId = ownerId,
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
                OwnerId = ownerId,
                EventType = "Created"
            }, "restaurant.created");

            return CreatedAtAction(nameof(GetRestaurant), new { id = restaurant.Id }, restaurant);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRestaurant(int id, [FromBody] UpdateRestaurantDto dto)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null) return NotFound();

            restaurant.Name = dto.Name;
            restaurant.Cuisine = dto.Cuisine ?? string.Empty;
            restaurant.ImageUrl = dto.ImageUrl ?? string.Empty;
            restaurant.Description = dto.Description ?? string.Empty;
            restaurant.Address = dto.Address;
            restaurant.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(restaurant);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRestaurant(int id)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null) return NotFound();

            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();
            return NoContent();
        }

    }
}
