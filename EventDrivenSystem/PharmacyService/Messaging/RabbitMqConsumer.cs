using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using PharmacyService.Data;
using PharmacyService.Models;

namespace PharmacyService.Messaging;

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

            await _channel.ExchangeDeclareAsync("user_events", ExchangeType.Direct, true, cancellationToken: stoppingToken);
            await _channel.QueueDeclareAsync("pharmacy_user_queue", true, false, false, cancellationToken: stoppingToken);

            foreach (var key in new[] { "user.created", "user.updated", "user.deleted" })
                await _channel.QueueBindAsync("pharmacy_user_queue", "user_events", key, cancellationToken: stoppingToken);

            var consumer = new AsyncEventingBasicConsumer(_channel);
            consumer.ReceivedAsync += (model, ea) => HandleMessageAsync(ea, stoppingToken);
            await _channel.BasicConsumeAsync("pharmacy_user_queue", false, consumer, cancellationToken: stoppingToken);

            _logger.LogInformation("PharmacyService consumer started, waiting for user events...");
            while (!stoppingToken.IsCancellationRequested)
                await Task.Delay(1000, stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error starting pharmacy consumer");
            throw;
        }
    }

    private async Task HandleMessageAsync(BasicDeliverEventArgs ea, CancellationToken stoppingToken)
    {
        try
        {
            var message = Encoding.UTF8.GetString(ea.Body.ToArray());
            var userEvent = JsonSerializer.Deserialize<UserEventData>(message);

            if (userEvent != null && userEvent.UserType == "CMS")
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<PharmacyDbContext>();
                var existing = await db.Users.FindAsync(userEvent.UserId);

                if (userEvent.EventType.Equals("deleted", StringComparison.OrdinalIgnoreCase))
                {
                    if (existing != null) db.Users.Remove(existing);
                }
                else
                {
                    if (existing == null)
                        db.Users.Add(new User { Id = userEvent.UserId, FirstName = userEvent.FirstName, LastName = userEvent.LastName, Email = userEvent.Email, UserType = userEvent.UserType });
                    else
                    { existing.FirstName = userEvent.FirstName; existing.LastName = userEvent.LastName; existing.Email = userEvent.Email; }
                }

                await db.SaveChangesAsync();
            }

            if (_channel != null)
                await _channel.BasicAckAsync(ea.DeliveryTag, false, stoppingToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing user event in PharmacyService");
            if (_channel != null)
                await _channel.BasicNackAsync(ea.DeliveryTag, false, true, stoppingToken);
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
