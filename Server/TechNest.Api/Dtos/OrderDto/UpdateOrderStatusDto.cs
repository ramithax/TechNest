namespace TechNest.Api.Dtos.OrderDto
{
    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? TrackingNumber { get; set; }
    }
}
