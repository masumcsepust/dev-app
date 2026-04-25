using ConsumerService.Data;
using ConsumerService.Messaging;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateApplicationBuilder(args);

// Add services
builder.Services.AddHostedService<RabbitMqConsumer>();

// Configure Entity Framework with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ConsumerDbContext>(options =>
    options.UseNpgsql(connectionString));

var host = builder.Build();

// Create database if it doesn't exist
using (var scope = host.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ConsumerDbContext>();
    await dbContext.Database.MigrateAsync();
}

host.Run();
