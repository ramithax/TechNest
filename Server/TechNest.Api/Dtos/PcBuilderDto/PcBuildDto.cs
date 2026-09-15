namespace TechNest.Api.Dtos.PcBuilderDto
{
    public class PcBuildDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<BuildItemDto> Items { get; set; } = new();
    }
}