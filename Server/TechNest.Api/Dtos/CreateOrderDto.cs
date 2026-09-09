using System.ComponentModel.DataAnnotations;
using TechNest.Api.Dtos.OrderDto;

namespace TechNest.Api.Dtos
{
    public class CreateOrderDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required]
        public string ContactNumber { get; set; } = string.Empty;

        public string OrderType { get; set; } = "CustomPC";

        [Required]
        [MinLength(1, ErrorMessage = "An order must contain at least one item.")]
        public List<CreateOrderItemDto> Items { get; set; } = new();
    }
}
