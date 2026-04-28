using Microsoft.EntityFrameworkCore;
using RestaurantService.Data;
using RestaurantService.Models;

namespace RestaurantService.Repositories;

public interface IReservationRepository
{
    Task<IEnumerable<Reservation>> GetByRestaurantAsync(int restaurantId);
    Task<Reservation?> GetByIdAsync(int id);
    Task<Reservation> AddAsync(Reservation reservation);
    Task<Reservation> UpdateAsync(Reservation reservation);
    Task<bool> DeleteAsync(int id);
}

public class ReservationRepository : IReservationRepository
{
    private readonly RestaurantDbContext _context;

    public ReservationRepository(RestaurantDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Reservation>> GetByRestaurantAsync(int restaurantId)
    {
        return await _context.Reservations
            .Include(r => r.Table)
            .Where(r => r.Table!.RestaurantId == restaurantId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Reservation?> GetByIdAsync(int id)
    {
        return await _context.Reservations
            .Include(r => r.Table)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Reservation> AddAsync(Reservation reservation)
    {
        reservation.CreatedAt = DateTime.UtcNow;
        reservation.UpdatedAt = DateTime.UtcNow;

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();
        return reservation;
    }

    public async Task<Reservation> UpdateAsync(Reservation reservation)
    {
        reservation.UpdatedAt = DateTime.UtcNow;
        _context.Reservations.Update(reservation);
        await _context.SaveChangesAsync();
        return reservation;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var reservation = await _context.Reservations.FindAsync(id);
        if (reservation == null) return false;

        _context.Reservations.Remove(reservation);
        await _context.SaveChangesAsync();
        return true;
    }
}
