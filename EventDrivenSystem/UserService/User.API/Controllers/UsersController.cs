using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using User.Core;
using User.Core.DTOs;
using User.Core.Events;
using User.Infrastructure.Repositories;
using User.Infrastructure.Messaging;

namespace User.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _repository;
    private readonly IMessagePublisher _messagePublisher;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        IUserRepository repository,
        IMessagePublisher messagePublisher,
        ILogger<UsersController> logger)
    {
        _repository = repository;
        _messagePublisher = messagePublisher;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
    {
        var users = await _repository.GetAllAsync();
        var userDtos = users.Select(u => new UserDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Email = u.Email,
            PhoneNumber = u.PhoneNumber,
            UserType = u.UserType,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt
        });
        return Ok(userDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUserById(int id)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null)
            return NotFound($"User with id {id} not found");

        var userDto = new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            UserType = user.UserType,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
        return Ok(userDto);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
    {
        var user = new UserEntity
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            UserType = dto.UserType,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdUser = await _repository.CreateAsync(user);

        // Publish event
        try
        {
            var userEvent = new UserEvent
            {
                UserId = createdUser.Id,
                FirstName = createdUser.FirstName,
                LastName = createdUser.LastName,
                Email = createdUser.Email,
                PhoneNumber = createdUser.PhoneNumber,
                UserType = createdUser.UserType.ToString(),
                EventType = "Created",
                Timestamp = DateTime.UtcNow
            };
            await _messagePublisher.PublishUserEventAsync(userEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing user created event");
        }

        var userDto = new UserDto
        {
            Id = createdUser.Id,
            FirstName = createdUser.FirstName,
            LastName = createdUser.LastName,
            Email = createdUser.Email,
            PhoneNumber = createdUser.PhoneNumber,
            UserType = createdUser.UserType,
            CreatedAt = createdUser.CreatedAt,
            UpdatedAt = createdUser.UpdatedAt
        };

        return CreatedAtAction(nameof(GetUserById), new { id = createdUser.Id }, userDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(int id, UpdateUserDto dto)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null)
            return NotFound($"User with id {id} not found");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        user.PhoneNumber = dto.PhoneNumber;
        user.UserType = dto.UserType;

        var updatedUser = await _repository.UpdateAsync(user);

        // Publish event
        try
        {
            var userEvent = new UserEvent
            {
                UserId = updatedUser.Id,
                FirstName = updatedUser.FirstName,
                LastName = updatedUser.LastName,
                Email = updatedUser.Email,
                PhoneNumber = updatedUser.PhoneNumber,
                UserType = updatedUser.UserType.ToString(),
                EventType = "Updated",
                Timestamp = DateTime.UtcNow
            };
            await _messagePublisher.PublishUserEventAsync(userEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing user updated event");
        }

        var userDto = new UserDto
        {
            Id = updatedUser.Id,
            FirstName = updatedUser.FirstName,
            LastName = updatedUser.LastName,
            Email = updatedUser.Email,
            PhoneNumber = updatedUser.PhoneNumber,
            UserType = updatedUser.UserType,
            CreatedAt = updatedUser.CreatedAt,
            UpdatedAt = updatedUser.UpdatedAt
        };

        return Ok(userDto);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(int id)
    {
        var user = await _repository.GetByIdAsync(id);
        if (user == null)
            return NotFound($"User with id {id} not found");

        var result = await _repository.DeleteAsync(id);
        if (!result)
            return NotFound($"User with id {id} not found");

        // Publish event
        try
        {
            var userEvent = new UserEvent
            {
                UserId = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                UserType = user.UserType.ToString(),
                EventType = "Deleted",
                Timestamp = DateTime.UtcNow
            };
            await _messagePublisher.PublishUserEventAsync(userEvent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing user deleted event");
        }

        return NoContent();
    }
}
