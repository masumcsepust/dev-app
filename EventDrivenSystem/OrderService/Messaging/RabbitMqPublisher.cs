using System;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;

namespace OrderService.Messaging
{
    public interface IMessagePublisher
    {
        Task PublishEventAsync<T>(T eventData, string routingKey);
    }

    public class RabbitMqPublisher : IMessagePublisher
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<RabbitMqPublisher> _logger;

        public RabbitMqPublisher(IConfiguration configuration, ILogger<RabbitMqPublisher> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task PublishEventAsync<T>(T eventData, string routingKey)
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

                using var connection = await factory.CreateConnectionAsync();
                using var channel = await connection.CreateChannelAsync();

                // Declare exchange
                await channel.ExchangeDeclareAsync(
                    exchange: "order_events",
                    type: ExchangeType.Direct,
                    durable: true);

                var message = JsonSerializer.Serialize(eventData);
                var body = Encoding.UTF8.GetBytes(message);

                var properties = new BasicProperties
                {
                    Persistent = true
                };

                await channel.BasicPublishAsync(
                    exchange: "order_events",
                    routingKey: routingKey,
                    mandatory: false,
                    basicProperties: properties,
                    body: body);

                _logger.LogInformation($"Event published to order_events with routing key {routingKey}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error publishing event to RabbitMQ");
            }
        }
    }
}
