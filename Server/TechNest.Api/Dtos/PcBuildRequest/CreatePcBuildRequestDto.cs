using TechNest.Api.DTOs.PcBuildRequest;

namespace TechNest.Api.Dtos.PcBuildRequest;

public class CreatePcBuildRequestDto
{
    public string WorkflowId { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public string? CustomerNote { get; set; }
    public List<CreatePcBuildRequestItemDto> Items { get; set; } = new();
}