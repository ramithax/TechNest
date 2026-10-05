namespace TechNest.Api.Dtos.AgentDto;

public class AgentPlanStep
{
    public int Step { get; set; }
    public string Agent { get; set; } = string.Empty;
    public string Task { get; set; } = string.Empty;
}
