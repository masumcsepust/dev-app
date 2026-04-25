using System;

namespace RestaurantService.Models
{
    // Replicated User entity from UserService via RabbitMQ
    public class User
    {
        public int Id { get; set; } // Generated in UserService, we use ValueGeneratedNever
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
    }
}
