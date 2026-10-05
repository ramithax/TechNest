namespace TechNest.Api.Dtos.PcBuilderDto
{
    public class PcBuildHistoryDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ItemCount { get; set; }
        public decimal TotalPrice { get; set; }
    }
}