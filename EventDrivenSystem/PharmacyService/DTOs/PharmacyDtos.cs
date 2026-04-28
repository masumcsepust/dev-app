namespace PharmacyService.DTOs;

public record CreateCategoryDto(string Name, string Description);
public record UpdateCategoryDto(string Name, string Description);

public record CreateMedicineDto(
    string Name, string GenericName, string Manufacturer,
    string Description, string SideEffects, string Dosage,
    string Form, decimal Price, int StockQuantity,
    bool RequiresPrescription, bool IsAvailable,
    string ImageUrl, int? CategoryId);

public record UpdateMedicineDto(
    string Name, string GenericName, string Manufacturer,
    string Description, string SideEffects, string Dosage,
    string Form, decimal Price, int StockQuantity,
    bool RequiresPrescription, bool IsAvailable,
    string ImageUrl, int? CategoryId);

public record CreatePrescriptionDto(
    string CustomerName, string CustomerPhone, string CustomerEmail,
    string DoctorName, string Notes, string ImageUrl,
    List<PrescriptionItemDto> Items);

public record PrescriptionItemDto(int MedicineId, int Quantity);

public record UpdatePrescriptionStatusDto(string Status);

public record CreateOrderDto(
    string CustomerName, string CustomerPhone,
    string DeliveryAddress, List<OrderItemDto> Items,
    string? CustomerEmail = null, string? Notes = null);

public record OrderItemDto(int MedicineId, int Quantity);

public record UpdateOrderStatusDto(string Status);
