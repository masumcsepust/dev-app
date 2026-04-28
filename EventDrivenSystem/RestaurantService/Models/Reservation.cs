using System;

namespace RestaurantService.Models
{
    public enum ReservationStatus
    {
        Booked,
        Seated,
        Completed,
        Cancelled,
        NoShow
    }

    public class Reservation
    {
        public int Id { get; set; }
        public int TableId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public DateTime ReservationDateTime { get; set; }
        public int GuestsCount { get; set; }
        public string SpecialRequest { get; set; } = string.Empty;
        public ReservationStatus Status { get; set; } = ReservationStatus.Booked;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public RestaurantTable? Table { get; set; }
    }
}
