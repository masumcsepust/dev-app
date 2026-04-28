using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyService.DTOs;
using PharmacyService.Services;

namespace PharmacyService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PrescriptionsController : ControllerBase
{
    private readonly IPrescriptionService _service;
    private readonly IWebHostEnvironment _env;

    public PrescriptionsController(IPrescriptionService service, IWebHostEnvironment env)
    {
        _service = service;
        _env = env;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await _service.GetByIdAsync(id);
        return p == null ? NotFound() : Ok(p);
    }

    [HttpGet("by-phone/{phone}")]
    public async Task<IActionResult> GetByPhone(string phone)
    {
        var prescriptions = await _service.GetByPhoneAsync(phone);
        return Ok(prescriptions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePrescriptionDto dto)
    {
        var p = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = p.Id }, p);
    }

    [Authorize]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePrescriptionStatusDto dto)
    {
        var p = await _service.UpdateStatusAsync(id, dto.Status);
        return p == null ? NotFound() : Ok(p);
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        if (image == null || image.Length == 0)
            return BadRequest(new { error = "No image provided" });
        var url = await _service.UploadImageAsync(image, _env.ContentRootPath);
        return Ok(new { imageUrl = url });
    }
}
