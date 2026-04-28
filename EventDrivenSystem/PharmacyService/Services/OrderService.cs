using Microsoft.EntityFrameworkCore;
using PharmacyService.Data;
using PharmacyService.DTOs;
using PharmacyService.Models;

namespace PharmacyService.Services;

public interface IOrderService
{
    Task<List<PharmacyOrder>> GetAllAsync();
    Task<PharmacyOrder?> GetByIdAsync(int id);
    Task<List<PharmacyOrder>> GetByPhoneAsync(string phone);
    Task<PharmacyOrder> CreateAsync(CreateOrderDto dto);
    Task<PharmacyOrder?> UpdateStatusAsync(int id, string status);
}

public class OrderService : IOrderService
{
    private readonly PharmacyDbContext _db;
    public OrderService(PharmacyDbContext db) => _db = db;

    public async Task<List<PharmacyOrder>> GetAllAsync() =>
        await _db.Orders.Include(o => o.Items).AsNoTracking().OrderByDescending(o => o.CreatedAt).ToListAsync();

    public async Task<PharmacyOrder?> GetByIdAsync(int id) =>
        await _db.Orders.Include(o => o.Items).AsNoTracking().FirstOrDefaultAsync(o => o.Id == id);

    public async Task<List<PharmacyOrder>> GetByPhoneAsync(string phone)
    {
        // Normalise to last 10 digits so 01XXXXXXXXX, +880XXXXXXXXX, 880XXXXXXXXX all match
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        var tail = digits.Length >= 10 ? digits[^10..] : digits;

        var all = await _db.Orders.Include(o => o.Items).AsNoTracking()
            .OrderByDescending(o => o.CreatedAt).ToListAsync();

        return all.Where(o =>
        {
            var d = new string(o.CustomerPhone.Where(char.IsDigit).ToArray());
            return d.EndsWith(tail);
        }).ToList();
    }

    public async Task<PharmacyOrder> CreateAsync(CreateOrderDto dto)
    {
        var order = new PharmacyOrder
        {
            CustomerName = dto.CustomerName, CustomerPhone = dto.CustomerPhone,
            CustomerEmail = dto.CustomerEmail ?? string.Empty, DeliveryAddress = dto.DeliveryAddress,
            Notes = dto.Notes ?? string.Empty, Status = OrderStatus.Placed,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };

        decimal total = 0;
        foreach (var item in dto.Items)
        {
            var medicine = await _db.Medicines.FindAsync(item.MedicineId)
                ?? throw new KeyNotFoundException($"Medicine {item.MedicineId} not found");
            if (medicine.StockQuantity < item.Quantity)
                throw new InvalidOperationException($"Insufficient stock for {medicine.Name}. Available: {medicine.StockQuantity}");

            medicine.StockQuantity -= item.Quantity;
            var lineTotal = medicine.Price * item.Quantity;
            total += lineTotal;
            order.Items.Add(new PharmacyOrderItem
            {
                MedicineId = item.MedicineId, MedicineName = medicine.Name,
                Quantity = item.Quantity, UnitPrice = medicine.Price
            });
        }

        order.TotalAmount = total;
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();
        return order;
    }

    public async Task<PharmacyOrder?> UpdateStatusAsync(int id, string status)
    {
        if (!Enum.TryParse<OrderStatus>(status, true, out var parsed))
            throw new InvalidOperationException($"Invalid order status: {status}");
        var order = await _db.Orders.FindAsync(id);
        if (order == null) return null;
        order.Status = parsed;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return order;
    }
}
