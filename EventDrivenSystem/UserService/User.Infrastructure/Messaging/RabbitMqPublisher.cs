using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;
using User.Core;
using User.Core.Events;

namespace User.Infrastructure.Messaging;

public interface IMessagePublisher
{
    Task PublishUserEventAsync(UserEvent userEvent);
}

public class RabbitMqPublisher : IMessagePublisher
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<RabbitMqPublisher> _logger;
    private IConnection? _connection;
    private IChannel? _channel;

    public RabbitMqPublisher(IConfiguration configuration, ILogger<RabbitMqPublisher> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    private async Task EnsureConnectionAsync()
    {
        if (_channel?.IsOpen ?? false)
            return;

        try
        {
            var factory = new ConnectionFactory
            {
                HostName = _configuration["RabbitMq:HostName"] ?? "localhost",
                Port = int.Parse(_configuration["RabbitMq:Port"] ?? "5672"),
                UserName = _configuration["RabbitMq:UserName"] ?? "guest",
                Password = _configuration["RabbitMq:Password"] ?? "guest"
            };

            _connection = await factory.CreateConnectionAsync();
            _channel = await _connection.CreateChannelAsync();

            await _channel.ExchangeDeclareAsync(
                exchange: "user_events",
                type: ExchangeType.Direct,
                durable: true);

            _logger.LogInformation("Connected to RabbitMQ successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to RabbitMQ");
            throw;
        }
    }

    public async Task PublishUserEventAsync(UserEvent userEvent)
    {
        try
        {
            await EnsureConnectionAsync();

            var routingKey = $"user.{userEvent.EventType.ToLower()}";
            var message = JsonSerializer.Serialize(userEvent);
            var body = Encoding.UTF8.GetBytes(message);

            var properties = new BasicProperties
            {
                ContentType = "application/json",
                Persistent = true
            };

            await _channel!.BasicPublishAsync(
                exchange: "user_events",
                routingKey: routingKey,
                mandatory: false,
                basicProperties: properties,
                body: new ReadOnlyMemory<byte>(body));

            _logger.LogInformation($"Published event: {userEvent.EventType} for user {userEvent.UserId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing message");
            throw;
        }
    }
}
