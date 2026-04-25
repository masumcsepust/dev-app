using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using ConsumerService.Data;
using ConsumerService.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ConsumerService.Messaging;

public class RabbitMqConsumer : BackgroundService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RabbitMqConsumer> _logger;
    private readonly IServiceProvider _serviceProvider;
    private IConnection? _connection;
    private IChannel? _channel;

    public RabbitMqConsumer(
        IConfiguration configuration,
        ILogger<RabbitMqConsumer> logger,
        IServiceProvider serviceProvider)
    {
        _configuration = configuration;
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await InitializeAsync(stoppingToken);
            _logger.LogInformation("Consumer Service started and listening for messages");
            
            // Keep the service running
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

    private async Task InitializeAsync(CancellationToken stoppingToken)
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

        _logger.LogInformation("Connected to RabbitMQ");

        // Declare exchange
        await _channel.ExchangeDeclareAsync(
            exchange: "user_events",
            type: ExchangeType.Direct,
            durable: true,
            cancellationToken: stoppingToken);

        // Declare queue
        await _channel.QueueDeclareAsync(
            queue: "consumer_service_queue",
            durable: true,
            exclusive: false,
            autoDelete: false,
            cancellationToken: stoppingToken);

        // Bind queue to exchange with routing keys
        var routingKeys = new[] { "user.created", "user.updated", "user.deleted" };
        foreach (var routingKey in routingKeys)
        {
            await _channel.QueueBindAsync(
                queue: "consumer_service_queue",
                exchange: "user_events",
                routingKey: routingKey,
                cancellationToken: stoppingToken);
        }

        _logger.LogInformation("Queue and bindings configured");

        // Set up consumer
        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.ReceivedAsync += (model, ea) => HandleMessageAsync(ea, stoppingToken);

        await _channel.BasicConsumeAsync(
            queue: "consumer_service_queue",
            autoAck: false,
            consumer: consumer,
            cancellationToken: stoppingToken);

        _logger.LogInformation("Consumer started, waiting for messages...");
    }

    private async Task HandleMessageAsync(BasicDeliverEventArgs ea, CancellationToken stoppingToken)
    {
        try
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            
            _logger.LogInformation($"Message received: {message}");
            
            var userEvent = JsonSerializer.Deserialize<UserEventData>(message);

            if (userEvent != null)
            {
                await SaveEventAsync(userEvent);
                if (_channel != null)
                {
                    await _channel.BasicAckAsync(ea.DeliveryTag, false, stoppingToken);
                }
                _logger.LogInformation($"Processed event: {userEvent.EventType} for user {userEvent.UserId}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing message");
            if (_channel != null)
            {
                try
                {
                    await _channel.BasicNackAsync(ea.DeliveryTag, false, true, stoppingToken);
                }
                catch (Exception nackEx)
                {
                    _logger.LogError(nackEx, "Error nacking message");
                }
            }
        }
    }

    private async Task SaveEventAsync(UserEventData userEvent)
    {
        try
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ConsumerDbContext>();

                var eventLog = new UserEventLog
                {
                    UserId = userEvent.UserId,
                    FirstName = userEvent.FirstName,
                    LastName = userEvent.LastName,
                    Email = userEvent.Email,
                    PhoneNumber = userEvent.PhoneNumber,
                    EventType = userEvent.EventType,
                    ReceivedAt = DateTime.UtcNow
                };

                dbContext.UserEventLogs.Add(eventLog);

                // Update Users table based on EventType
                var existingUser = await dbContext.Users.FindAsync(userEvent.UserId);
                
                if (userEvent.EventType.Equals("created", StringComparison.OrdinalIgnoreCase))
                {
                    if (existingUser == null)
                    {
                        dbContext.Users.Add(new User
                        {
                            Id = userEvent.UserId,
                            FirstName = userEvent.FirstName,
                            LastName = userEvent.LastName,
                            Email = userEvent.Email,
                            PhoneNumber = userEvent.PhoneNumber,
                            UserType = userEvent.UserType,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
                else if (userEvent.EventType.Equals("updated", StringComparison.OrdinalIgnoreCase))
                {
                    if (existingUser != null)
                    {
                        existingUser.FirstName = userEvent.FirstName;
                        existingUser.LastName = userEvent.LastName;
                        existingUser.Email = userEvent.Email;
                        existingUser.PhoneNumber = userEvent.PhoneNumber;
                        existingUser.UserType = userEvent.UserType;
                        existingUser.UpdatedAt = DateTime.UtcNow;
                    }
                    else
                    {
                        dbContext.Users.Add(new User
                        {
                            Id = userEvent.UserId,
                            FirstName = userEvent.FirstName,
                            LastName = userEvent.LastName,
                            Email = userEvent.Email,
                            PhoneNumber = userEvent.PhoneNumber,
                            UserType = userEvent.UserType,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        });
                    }
                }
                else if (userEvent.EventType.Equals("deleted", StringComparison.OrdinalIgnoreCase))
                {
                    if (existingUser != null)
                    {
                        dbContext.Users.Remove(existingUser);
                    }
                }

                await dbContext.SaveChangesAsync();
                
                _logger.LogInformation($"Event saved and Users table updated for user {userEvent.UserId}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving event to database");
            throw;
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stopping RabbitMQ consumer");
        
        if (_channel?.IsOpen ?? false)
            await _channel.CloseAsync(cancellationToken);

        if (_connection?.IsOpen ?? false)
            await _connection.CloseAsync(cancellationToken);

        await base.StopAsync(cancellationToken);
    }
}

public class UserEventData
{
    public int UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}
