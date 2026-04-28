using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyService.DTOs;
using PharmacyService.Services;

namespace PharmacyService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicinesController : ControllerBase
{
    private readonly IMedicineService _service;
    private readonly IWebHostEnvironment _env;

    public MedicinesController(IMedicineService service, IWebHostEnvironment env)
    {
        _service = service;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? categoryId,
        [FromQuery] bool? requiresPrescription,
        [FromQuery] string? search)
        => Ok(await _service.GetAllAsync(categoryId, requiresPrescription, search));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var medicine = await _service.GetByIdAsync(id);
        return medicine == null ? NotFound() : Ok(medicine);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMedicineDto dto)
    {
        var medicine = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = medicine.Id }, medicine);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMedicineDto dto)
    {
        var medicine = await _service.UpdateAsync(id, dto);
        return medicine == null ? NotFound() : Ok(medicine);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _service.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [Authorize]
    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        if (image == null || image.Length == 0)
            return BadRequest(new { error = "No image provided" });
        var url = await _service.UploadImageAsync(image, _env.ContentRootPath);
        return Ok(new { imageUrl = url });
    }

    // Called internally by OrderService after placing a pharmacy order
    [HttpPost("deduct-stock")]
    public async Task<IActionResult> DeductStock([FromBody] List<DeductStockRequest> items)
    {
        var mapped = items.Select(i => (i.MedicineId, i.Quantity)).ToList();
        await _service.DeductStockAsync(mapped);
        return Ok();
    }
}

public record DeductStockRequest(int MedicineId, int Quantity);
