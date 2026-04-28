using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.DTOs;
using OrderService.Models;
using OrderService.Services;

namespace OrderService.Controllers;

[ApiController]
[Route("api/pharmacy-orders")]
public class PharmacyOrdersController : ControllerBase
{
    private readonly OrderDbContext _db;
    private readonly IPharmacyClientService _pharmacy;

    public PharmacyOrdersController(OrderDbContext db, IPharmacyClientService pharmacy)
    {
        _db = db;
        _pharmacy = pharmacy;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.PharmacyOrders.Include(o => o.Items)
            .AsNoTracking().OrderByDescending(o => o.CreatedAt).ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _db.PharmacyOrders.Include(o => o.Items)
            .AsNoTracking().FirstOrDefaultAsync(o => o.Id == id);
        return order == null ? NotFound() : Ok(order);
    }

    [HttpGet("by-phone/{phone}")]
    public async Task<IActionResult> GetByPhone(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        var tail = digits.Length >= 10 ? digits[^10..] : digits;
        var all = await _db.PharmacyOrders.Include(o => o.Items)
            .AsNoTracking().OrderByDescending(o => o.CreatedAt).ToListAsync();
        var result = all.Where(o =>
        {
            var d = new string(o.CustomerPhone.Where(char.IsDigit).ToArray());
            return d.EndsWith(tail);
        }).ToList();
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePharmacyOrderDto dto)
    {
        var order = new PharmacyOrder
        {
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            CustomerEmail = dto.CustomerEmail ?? string.Empty,
            DeliveryAddress = dto.DeliveryAddress,
            Notes = dto.Notes ?? string.Empty,
            Status = PharmacyOrderStatus.Placed,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        decimal total = 0;
        var deductItems = new List<DeductStockItem>();

        foreach (var item in dto.Items)
        {
            var medicine = await _pharmacy.GetMedicineAsync(item.MedicineId);
            if (medicine == null)
                return BadRequest(new { error = $"Medicine {item.MedicineId} not found" });
            if (!medicine.IsAvailable || medicine.StockQuantity < item.Quantity)
                return BadRequest(new { error = $"Insufficient stock for {medicine.Name}. Available: {medicine.StockQuantity}" });

            total += medicine.Price * item.Quantity;
            order.Items.Add(new PharmacyOrderItem
            {
                MedicineId = item.MedicineId,
                MedicineName = medicine.Name,
                Quantity = item.Quantity,
                UnitPrice = medicine.Price
            });
            deductItems.Add(new DeductStockItem(item.MedicineId, item.Quantity));
        }

        order.TotalAmount = total;
        _db.PharmacyOrders.Add(order);
        await _db.SaveChangesAsync();

        await _pharmacy.DeductStockAsync(deductItems);

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePharmacyOrderStatusDto dto)
    {
        if (!Enum.TryParse<PharmacyOrderStatus>(dto.Status, true, out var parsed))
            return BadRequest(new { error = $"Invalid status: {dto.Status}" });
        var order = await _db.PharmacyOrders.FindAsync(id);
        if (order == null) return NotFound();
        order.Status = parsed;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(order);
    }
}
