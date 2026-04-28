namespace OrderService.DTOs;

public record PharmacyOrderItemInputDto(int MedicineId, int Quantity);

public record CreatePharmacyOrderDto(
    string CustomerName,
    string CustomerPhone,
    string DeliveryAddress,
    List<PharmacyOrderItemInputDto> Items,
    string? CustomerEmail = null,
    string? Notes = null);

public record UpdatePharmacyOrderStatusDto(string Status);
