namespace TechNest.Api.Models
{
    public class RepairService
    {
        public int Id { get; set; }
        public required string ServiceName { get; set; }
        public string? Description { get; set; }
        public decimal BasePrice { get; set; }
        public int EstimatedHours { get; set; }
    }
}