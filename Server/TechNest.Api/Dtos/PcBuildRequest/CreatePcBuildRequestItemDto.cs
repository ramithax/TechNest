namespace TechNest.Api.DTOs.PcBuildRequest;

public class CreatePcBuildRequestItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
    public string? Reason { get; set; }
}