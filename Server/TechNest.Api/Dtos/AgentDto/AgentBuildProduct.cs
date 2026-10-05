namespace TechNest.Api.Dtos.AgentDto;

public class AgentBuildProduct
{
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public string Reason { get; set; } = string.Empty;
}
