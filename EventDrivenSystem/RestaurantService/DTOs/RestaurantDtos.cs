namespace RestaurantService.DTOs
{
    public class CreateRestaurantDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Cuisine { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public string Address { get; set; } = string.Empty;
    }

    public class UpdateRestaurantDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Cuisine { get; set; }
        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        public string Address { get; set; } = string.Empty;
    }

    public class CreateMenuItemDto
    {
        public int RestaurantId { get; set; }
        public int? CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsAvailable { get; set; } = true;
    }
}

