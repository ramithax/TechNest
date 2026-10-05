using System.ComponentModel.DataAnnotations;

namespace TechNest.Api.Dtos.OrderDto
{
    public class CreatePcBuildRequestOrderDto
    {
        [Required]
        public int PcBuildRequestId { get; set; }

        [Required]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required]
        public string ContactNumber { get; set; } = string.Empty;
    }
}