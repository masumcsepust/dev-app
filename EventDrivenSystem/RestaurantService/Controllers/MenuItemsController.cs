using Microsoft.AspNetCore.Mvc;
using RestaurantService.DTOs;
using RestaurantService.Services;

namespace RestaurantService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MenuItemsController(IMenuItemService menuItemService, IWebHostEnvironment env) : ControllerBase
{
    private static readonly string[] AllowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    private const long MaxImageSize = 5 * 1024 * 1024;

    [HttpPost("upload-image")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        if (image == null || image.Length == 0)
            return BadRequest("No image provided.");

        if (!AllowedImageTypes.Contains(image.ContentType.ToLower()))
            return BadRequest("Only JPEG, PNG, WebP, and GIF images are allowed.");

        if (image.Length > MaxImageSize)
            return BadRequest("Image must be under 5MB.");

        var uploadsDir = Path.Combine(env.ContentRootPath, "uploads", "menu-items");
        Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(image.FileName).ToLower();
        var fileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, fileName);

        await using var stream = System.IO.File.Create(filePath);
        await image.CopyToAsync(stream);

        return Ok(new { imageUrl = $"/uploads/menu-items/{fileName}" });
    }

    [HttpGet("restaurant/{restaurantId}")]
    public async Task<IActionResult> GetMenu(int restaurantId)
    {
        var menuItems = await menuItemService.GetMenuItemsAsync(restaurantId);
        return Ok(menuItems);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMenuItem(int id)
    {
        var item = await menuItemService.GetMenuItemAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> AddMenuItem([FromBody] CreateMenuItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var item = await menuItemService.CreateMenuItemAsync(dto);
        return CreatedAtAction(nameof(GetMenuItem), new { id = item.Id }, item);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMenuItem(int id, [FromBody] UpdateMenuItemDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var item = await menuItemService.UpdateMenuItemAsync(id, dto);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMenuItem(int id)
    {
        var deleted = await menuItemService.DeleteMenuItemAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
