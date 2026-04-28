var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b => b.WithOrigins("http://localhost:4200", "http://localhost:4300")
              .AllowAnyMethod().AllowAnyHeader().AllowCredentials());
});

var app = builder.Build();

app.UseCors("AllowAll");
app.MapReverseProxy();

app.Run();
