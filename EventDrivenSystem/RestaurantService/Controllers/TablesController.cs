using Microsoft.AspNetCore.Mvc;
using RestaurantService.DTOs;
using RestaurantService.Services;

namespace RestaurantService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
    private readonly ITableService _tableService;

    public TablesController(ITableService tableService)
    {
        _tableService = tableService;
    }

    [HttpGet("restaurant/{restaurantId}")]
    public async Task<IActionResult> GetTables(int restaurantId)
    {
        var tables = await _tableService.GetTablesAsync(restaurantId);
        return Ok(tables);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTable(int id)
    {
        var table = await _tableService.GetTableAsync(id);
        return table == null ? NotFound() : Ok(table);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTable([FromBody] CreateTableDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var table = await _tableService.CreateTableAsync(dto);
        return CreatedAtAction(nameof(GetTable), new { id = table.Id }, table);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTable(int id, [FromBody] UpdateTableDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updated = await _tableService.UpdateTableAsync(id, dto);
        return updated == null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTable(int id)
    {
        var deleted = await _tableService.DeleteTableAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
