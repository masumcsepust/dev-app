using Microsoft.AspNetCore.Mvc;
using RestaurantService.DTOs;
using RestaurantService.Services;

namespace RestaurantService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpGet("restaurant/{restaurantId}")]
    public async Task<IActionResult> GetReservations(int restaurantId)
    {
        var reservations = await _reservationService.GetReservationsAsync(restaurantId);
        return Ok(reservations);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetReservation(int id)
    {
        var reservation = await _reservationService.GetReservationAsync(id);
        return reservation == null ? NotFound() : Ok(reservation);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var reservation = await _reservationService.CreateReservationAsync(dto);
        return CreatedAtAction(nameof(GetReservation), new { id = reservation.Id }, reservation);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateReservation(int id, [FromBody] UpdateReservationDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updated = await _reservationService.UpdateReservationAsync(id, dto);
        return updated == null ? NotFound() : Ok(updated);
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var cancelled = await _reservationService.CancelReservationAsync(id);
        return cancelled ? NoContent() : NotFound();
    }
}
