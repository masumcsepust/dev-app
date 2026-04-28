using System;
using System.Collections.Generic;

namespace RestaurantService.Models
{
    public enum TableStatus
    {
        Available,
        Occupied,
        Reserved,
        Maintenance
    }

    public enum DiningArea
    {
        GroundFloor,
        Rooftop,
        FamilyZone,
        AC_Room
    }

    public class RestaurantTable
    {
        public int Id { get; set; }
        public int RestaurantId { get; set; }
        public int TableNumber { get; set; }
        public int SeatingCapacity { get; set; }
        public TableStatus Status { get; set; } = TableStatus.Available;
        public DiningArea Area { get; set; } = DiningArea.GroundFloor;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public Restaurant? Restaurant { get; set; }
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
