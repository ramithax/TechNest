using System.ComponentModel.DataAnnotations;

namespace TechNest.Api.Dtos.PcBuilderDto
{
    public class BuildItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
        public List<string> Images { get; set; } = new();
    }
}