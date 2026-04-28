using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.DTOs;
using RestaurantService.Models;
using RestaurantService.Repositories;

namespace RestaurantService.Services;

public interface IReservationService
{
    Task<IEnumerable<Reservation>> GetReservationsAsync(int restaurantId);
    Task<Reservation?> GetReservationAsync(int reservationId);
    Task<Reservation> CreateReservationAsync(CreateReservationDto dto);
    Task<Reservation?> UpdateReservationAsync(int reservationId, UpdateReservationDto dto);
    Task<bool> CancelReservationAsync(int reservationId);
}

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _repository;
    private readonly RestaurantDbContext _context;

    public ReservationService(IReservationRepository repository, RestaurantDbContext context)
    {
        _repository = repository;
        _context = context;
    }

    public Task<IEnumerable<Reservation>> GetReservationsAsync(int restaurantId)
    {
        return _repository.GetByRestaurantAsync(restaurantId);
    }

    public Task<Reservation?> GetReservationAsync(int reservationId)
    {
        return _repository.GetByIdAsync(reservationId);
    }

    public async Task<Reservation> CreateReservationAsync(CreateReservationDto dto)
    {
        var table = await _context.RestaurantTables.FindAsync(dto.TableId);
        if (table == null)
            throw new KeyNotFoundException("Table not found.");

        if (dto.ReservationDateTime <= DateTime.UtcNow)
            throw new InvalidOperationException("Reservation date and time must be in the future.");

        var reservation = new Reservation
        {
            TableId = dto.TableId,
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            CustomerEmail = dto.CustomerEmail,
            ReservationDateTime = dto.ReservationDateTime,
            GuestsCount = dto.GuestsCount,
            SpecialRequest = dto.SpecialRequest,
            Status = dto.Status
        };

        return await _repository.AddAsync(reservation);
    }

    public async Task<Reservation?> UpdateReservationAsync(int reservationId, UpdateReservationDto dto)
    {
        var reservation = await _repository.GetByIdAsync(reservationId);
        if (reservation == null) return null;

        if (dto.ReservationDateTime <= DateTime.UtcNow)
            throw new InvalidOperationException("Reservation date and time must be in the future.");

        reservation.ReservationDateTime = dto.ReservationDateTime;
        reservation.GuestsCount = dto.GuestsCount;
        reservation.SpecialRequest = dto.SpecialRequest;
        reservation.Status = dto.Status;

        return await _repository.UpdateAsync(reservation);
    }

    public async Task<bool> CancelReservationAsync(int reservationId)
    {
        var reservation = await _repository.GetByIdAsync(reservationId);
        if (reservation == null) return false;

        reservation.Status = ReservationStatus.Cancelled;
        await _repository.UpdateAsync(reservation);
        return true;
    }
}
