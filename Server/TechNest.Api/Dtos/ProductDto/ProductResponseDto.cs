namespace TechNest.Api.Dtos.ProductDto
{
    public class ProductResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public decimal LabelPrice { get; set; }

        public decimal ActualPrice { get; set; }

        public int StockQuantity { get; set; }

        public string Category { get; set; } = string.Empty;

        public string Brand { get; set; } = string.Empty;

        public List<string> Images { get; set; } = new();

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}