# ── Build ──────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for restore (cache layer)
COPY UserService/User.API/User.API.csproj          UserService/User.API/
COPY UserService/User.Core/User.Core.csproj        UserService/User.Core/
COPY UserService/User.Infrastructure/User.Infrastructure.csproj UserService/User.Infrastructure/

RUN dotnet restore UserService/User.API/User.API.csproj

# Copy all source and publish
COPY UserService/ UserService/
RUN dotnet publish UserService/User.API/User.API.csproj \
    -c Release -o /app/publish --no-restore

# ── Runtime ─────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "User.API.dll"]
