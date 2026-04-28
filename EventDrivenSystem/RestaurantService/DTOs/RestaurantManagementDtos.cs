using System.ComponentModel.DataAnnotations;
using RestaurantService.Models;

namespace RestaurantService.DTOs
{
    public class CreateFoodCategoryDto
    {
        [Required]
        public int RestaurantId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateFoodCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateMenuItemDto
    {
        [Required]
        public int RestaurantId { get; set; }

        public int? CategoryId { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Range(0.0, 10000.0)]
        public decimal Price { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public bool IsAvailable { get; set; } = true;
    }

    public class CreateTableDto
    {
        [Required]
        public int RestaurantId { get; set; }

        [Required]
        public int TableNumber { get; set; }

        [Required]
        [Range(1, 20)]
        public int SeatingCapacity { get; set; }

        public TableStatus Status { get; set; } = TableStatus.Available;
        public DiningArea Area { get; set; } = DiningArea.GroundFloor;
    }

    public class UpdateTableDto
    {
        [Required]
        public int TableNumber { get; set; }

        [Required]
        [Range(1, 20)]
        public int SeatingCapacity { get; set; }

        public TableStatus Status { get; set; } = TableStatus.Available;
        public DiningArea Area { get; set; } = DiningArea.GroundFloor;
    }

    public class CreateReservationDto
    {
        [Required]
        public int TableId { get; set; }

        [Required]
        [MaxLength(100)]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string CustomerPhone { get; set; } = string.Empty;

        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        public DateTime ReservationDateTime { get; set; }

        [Required]
        [Range(1, 20)]
        public int GuestsCount { get; set; }

        [MaxLength(1000)]
        public string SpecialRequest { get; set; } = string.Empty;

        public ReservationStatus Status { get; set; } = ReservationStatus.Booked;
    }

    public class UpdateReservationDto
    {
        [Required]
        public DateTime ReservationDateTime { get; set; }

        [Required]
        [Range(1, 20)]
        public int GuestsCount { get; set; }

        [MaxLength(1000)]
        public string SpecialRequest { get; set; } = string.Empty;

        public ReservationStatus Status { get; set; } = ReservationStatus.Booked;
    }
}
