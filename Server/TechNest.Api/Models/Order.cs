namespace TechNest.Api.Models
{
    public class Order
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public string CustomerEmail { get; set; } = string.Empty;

        public string ShippingAddress { get; set; } = string.Empty;

        public string ContactNumber { get; set; } = string.Empty;

        public string OrderType { get; set; } = "CustomPC";

        public string Status { get; set; } = "Pending";

        public decimal TotalAmount { get; set; }

        public string? TrackingNumber { get; set; }

        public string? AdminNotes { get; set; }

        public List<OrderItem> Items { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
