using System;
using System.Collections.Generic;

namespace RestaurantService.Models
{
    public class Restaurant
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Cuisine { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int OwnerId { get; set; } // Links to User (CMS Role)
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ICollection<FoodCategory> Categories { get; set; } = new List<FoodCategory>();
        public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
        public ICollection<RestaurantTable> Tables { get; set; } = new List<RestaurantTable>();
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
