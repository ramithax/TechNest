namespace TechNest.Api.Dtos.AgentDto;

public class AgentBuildSummary
{
    public List<AgentBuildProduct> Products { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string Explanation { get; set; } = string.Empty;
}
