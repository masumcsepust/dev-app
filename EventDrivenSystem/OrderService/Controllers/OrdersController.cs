using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.DTOs;
using OrderService.Events;
using OrderService.Messaging;
using OrderService.Models;

namespace OrderService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderDbContext _context;
        private readonly IMessagePublisher _messagePublisher;

        public OrdersController(OrderDbContext context, IMessagePublisher messagePublisher)
        {
            _context = context;
            _messagePublisher = messagePublisher;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] int? customerId, [FromQuery] int? restaurantId)
        {
            var query = _context.Orders.Include(o => o.OrderItems).AsQueryable();

            if (customerId.HasValue)
                query = query.Where(o => o.CustomerId == customerId.Value);

            if (restaurantId.HasValue)
                query = query.Where(o => o.RestaurantId == restaurantId.Value);

            var orders = await query.ToListAsync();
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _context.Orders.Include(o => o.OrderItems).FirstOrDefaultAsync(o => o.Id == id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var customer = await _context.Users.FindAsync(dto.CustomerId);
            if (customer == null) return BadRequest("Customer not found.");

            var restaurant = await _context.Restaurants.FindAsync(dto.RestaurantId);
            if (restaurant == null) return BadRequest("Restaurant not found.");

            var order = new Order
            {
                CustomerId = dto.CustomerId,
                RestaurantId = dto.RestaurantId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                TotalAmount = 0
            };

            foreach (var itemDto in dto.Items)
            {
                var menuItem = await _context.MenuItems.FindAsync(itemDto.MenuItemId);
                if (menuItem == null || menuItem.RestaurantId != dto.RestaurantId || !menuItem.IsAvailable)
                    return BadRequest($"MenuItem {itemDto.MenuItemId} is invalid or unavailable.");

                var orderItem = new OrderItem
                {
                    MenuItemId = itemDto.MenuItemId,
                    Quantity = itemDto.Quantity,
                    Price = menuItem.Price
                };
                order.OrderItems.Add(orderItem);
                order.TotalAmount += (orderItem.Price * orderItem.Quantity);
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Publish event
            await _messagePublisher.PublishEventAsync(new OrderEvent
            {
                OrderId = order.Id,
                CustomerId = order.CustomerId,
                RestaurantId = order.RestaurantId,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                EventType = "OrderCreated"
            }, "order.created");

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            order.Status = dto.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Publish event
            await _messagePublisher.PublishEventAsync(new OrderEvent
            {
                OrderId = order.Id,
                CustomerId = order.CustomerId,
                RestaurantId = order.RestaurantId,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                EventType = "OrderStatusUpdated"
            }, "order.updated");

            return Ok(order);
        }
    }
}
