using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using RestaurantService.Data;
using RestaurantService.Models;

namespace RestaurantService.Messaging
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

                // We listen to user_events
                await _channel.ExchangeDeclareAsync("user_events", ExchangeType.Direct, true, cancellationToken: stoppingToken);
                await _channel.QueueDeclareAsync("restaurant_user_queue", true, false, false, cancellationToken: stoppingToken);
                
                var routingKeys = new[] { "user.created", "user.updated", "user.deleted" };
                foreach (var routingKey in routingKeys)
                {
                    await _channel.QueueBindAsync("restaurant_user_queue", "user_events", routingKey, cancellationToken: stoppingToken);
                }

                var consumer = new AsyncEventingBasicConsumer(_channel);
                consumer.ReceivedAsync += (model, ea) => HandleMessageAsync(ea, stoppingToken);

                await _channel.BasicConsumeAsync("restaurant_user_queue", false, consumer, cancellationToken: stoppingToken);
                _logger.LogInformation("RestaurantService Consumer started, waiting for user events...");
                
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

        private async Task HandleMessageAsync(BasicDeliverEventArgs ea, CancellationToken stoppingToken)
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var userEvent = JsonSerializer.Deserialize<UserEventData>(message);

                if (userEvent != null && userEvent.UserType == "CMS") // Only replicate CMS users for restaurant owners
                {
                    using var scope = _serviceProvider.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<RestaurantDbContext>();
                    var existingUser = await dbContext.Users.FindAsync(userEvent.UserId);

                    if (userEvent.EventType.Equals("created", StringComparison.OrdinalIgnoreCase) || userEvent.EventType.Equals("updated", StringComparison.OrdinalIgnoreCase))
                    {
                        if (existingUser == null)
                        {
                            dbContext.Users.Add(new User
                            {
                                Id = userEvent.UserId,
                                FirstName = userEvent.FirstName,
                                LastName = userEvent.LastName,
                                Email = userEvent.Email,
                                UserType = userEvent.UserType
                            });
                        }
                        else
                        {
                            existingUser.FirstName = userEvent.FirstName;
                            existingUser.LastName = userEvent.LastName;
                            existingUser.Email = userEvent.Email;
                            existingUser.UserType = userEvent.UserType;
                        }
                    }
                    else if (userEvent.EventType.Equals("deleted", StringComparison.OrdinalIgnoreCase) && existingUser != null)
                    {
                        dbContext.Users.Remove(existingUser);
                    }

                    await dbContext.SaveChangesAsync();
                }

                if (_channel != null)
                {
                    await _channel.BasicAckAsync(ea.DeliveryTag, false, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing user event message in RestaurantService");
                if (_channel != null)
                {
                    await _channel.BasicNackAsync(ea.DeliveryTag, false, true, stoppingToken);
                }
            }
        }
    }

    public class UserEventData
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string EventType { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
