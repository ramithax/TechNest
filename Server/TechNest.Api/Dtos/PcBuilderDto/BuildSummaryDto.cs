namespace TechNest.Api.Dtos.PcBuilderDto
{
    public class BuildSummaryDto
    {
        public int PcBuildId { get; set; }

        public List<BuildItemDto> Items { get; set; } = new();

        public decimal TotalPrice { get; set; }
    }
}