using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using OrderService.Data;
using OrderService.Models;

namespace OrderService.Messaging
{
    public class RabbitMqConsumer : BackgroundService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<RabbitMqConsumer> _logger;
        private readonly IServiceProvider _serviceProvider;
        private IConnection? _connection;
        private IChannel? _channel;

        public RabbitMqConsumer(IConfiguration configuration, ILogger<RabbitMqConsumer> logger, IServiceProvider serviceProvider)
        {
            _configuration = configuration;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _configuration["RabbitMq:HostName"] ?? "localhost",
                    Port = int.Parse(_configuration["RabbitMq:Port"] ?? "5672"),
                    UserName = _configuration["RabbitMq:UserName"] ?? "guest",
                    Password = _configuration["RabbitMq:Password"] ?? "guest"
                };

                _connection = await factory.CreateConnectionAsync(stoppingToken);
                _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);

                // Declare exchanges
                await _channel.ExchangeDeclareAsync("user_events", ExchangeType.Direct, true, cancellationToken: stoppingToken);
                await _channel.ExchangeDeclareAsync("restaurant_events", ExchangeType.Direct, true, cancellationToken: stoppingToken);

                // Queue for user events
                await _channel.QueueDeclareAsync("order_user_queue", true, false, false, cancellationToken: stoppingToken);
                foreach (var routingKey in new[] { "user.created", "user.updated", "user.deleted" })
                    await _channel.QueueBindAsync("order_user_queue", "user_events", routingKey, cancellationToken: stoppingToken);

                // Queue for restaurant and menu events
                await _channel.QueueDeclareAsync("order_restaurant_queue", true, false, false, cancellationToken: stoppingToken);
                foreach (var routingKey in new[] { "restaurant.created", "restaurant.updated", "menu.updated", "menu.deleted" })
                    await _channel.QueueBindAsync("order_restaurant_queue", "restaurant_events", routingKey, cancellationToken: stoppingToken);

                // Set up consumers
                var userConsumer = new AsyncEventingBasicConsumer(_channel);
                userConsumer.ReceivedAsync += HandleUserEventAsync;
                await _channel.BasicConsumeAsync("order_user_queue", false, userConsumer, cancellationToken: stoppingToken);

                var restConsumer = new AsyncEventingBasicConsumer(_channel);
                restConsumer.ReceivedAsync += HandleRestaurantEventAsync;
                await _channel.BasicConsumeAsync("order_restaurant_queue", false, restConsumer, cancellationToken: stoppingToken);

                _logger.LogInformation("OrderService Consumers started...");
                
                while (!stoppingToken.IsCancellationRequested)
                {
                    await Task.Delay(1000, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting consumer");
                throw;
            }
        }

        private async Task HandleUserEventAsync(object sender, BasicDeliverEventArgs ea)
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                using var document = JsonDocument.Parse(message);
                var root = document.RootElement;
                
                var eventType = root.GetProperty("EventType").GetString() ?? "";
                var userId = root.GetProperty("UserId").GetInt32();
                var firstName = root.GetProperty("FirstName").GetString() ?? "";
                var lastName = root.GetProperty("LastName").GetString() ?? "";
                var email = root.GetProperty("Email").GetString() ?? "";
                var userType = root.GetProperty("UserType").GetString() ?? "Customer";

                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
                var existingUser = await dbContext.Users.FindAsync(userId);

                if (eventType.Equals("created", StringComparison.OrdinalIgnoreCase) || eventType.Equals("updated", StringComparison.OrdinalIgnoreCase))
                {
                    if (existingUser == null)
                    {
                        dbContext.Users.Add(new User { Id = userId, FirstName = firstName, LastName = lastName, Email = email, UserType = userType });
                    }
                    else
                    {
                        existingUser.FirstName = firstName;
                        existingUser.LastName = lastName;
                        existingUser.Email = email;
                        existingUser.UserType = userType;
                    }
                }
                else if (eventType.Equals("deleted", StringComparison.OrdinalIgnoreCase) && existingUser != null)
                {
                    dbContext.Users.Remove(existingUser);
                }

                await dbContext.SaveChangesAsync();

                if (_channel != null) await _channel.BasicAckAsync(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing user event");
                if (_channel != null) await _channel.BasicNackAsync(ea.DeliveryTag, false, true);
            }
        }

        private async Task HandleRestaurantEventAsync(object sender, BasicDeliverEventArgs ea)
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var routingKey = ea.RoutingKey;

                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<OrderDbContext>();

                if (routingKey.StartsWith("restaurant."))
                {
                    using var document = JsonDocument.Parse(message);
                    var root = document.RootElement;
                    var restaurantId = root.GetProperty("RestaurantId").GetInt32();
                    var name = root.GetProperty("Name").GetString() ?? "";
                    var ownerId = root.GetProperty("OwnerId").GetInt32();

                    var existingRest = await dbContext.Restaurants.FindAsync(restaurantId);
                    if (existingRest == null)
                    {
                        dbContext.Restaurants.Add(new Restaurant { Id = restaurantId, Name = name, OwnerId = ownerId });
                    }
                    else
                    {
                        existingRest.Name = name;
                        existingRest.OwnerId = ownerId;
                    }
                }
                else if (routingKey.StartsWith("menu."))
                {
                    using var document = JsonDocument.Parse(message);
                    var root = document.RootElement;
                    var menuItemId = root.GetProperty("MenuItemId").GetInt32();
                    var restaurantId = root.GetProperty("RestaurantId").GetInt32();
                    var name = root.GetProperty("Name").GetString() ?? "";
                    var price = root.GetProperty("Price").GetDecimal();
                    var isAvailable = root.GetProperty("IsAvailable").GetBoolean();

                    var existingMenu = await dbContext.MenuItems.FindAsync(menuItemId);
                    if (existingMenu == null)
                    {
                        dbContext.MenuItems.Add(new MenuItem { Id = menuItemId, RestaurantId = restaurantId, Name = name, Price = price, IsAvailable = isAvailable });
                    }
                    else
                    {
                        existingMenu.Name = name;
                        existingMenu.Price = price;
                        existingMenu.IsAvailable = isAvailable;
                    }
                }

                await dbContext.SaveChangesAsync();

                if (_channel != null) await _channel.BasicAckAsync(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing restaurant/menu event");
                if (_channel != null) await _channel.BasicNackAsync(ea.DeliveryTag, false, true);
            }
        }
    }
}
