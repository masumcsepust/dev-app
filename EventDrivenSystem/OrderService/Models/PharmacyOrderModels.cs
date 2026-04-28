namespace OrderService.Models;

public enum PharmacyOrderStatus { Placed, Processing, Ready, Delivered, Cancelled }

public class PharmacyOrder
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public PharmacyOrderStatus Status { get; set; } = PharmacyOrderStatus.Placed;
    public decimal TotalAmount { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<PharmacyOrderItem> Items { get; set; } = new();
}

public class PharmacyOrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public PharmacyOrder Order { get; set; } = null!;
    public int MedicineId { get; set; }
    public string MedicineName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
