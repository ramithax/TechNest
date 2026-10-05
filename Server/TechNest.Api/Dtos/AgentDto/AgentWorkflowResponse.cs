using System.Text.Json;

namespace TechNest.Api.Dtos.AgentDto;

public class AgentWorkflowResponse
{
    public string WorkflowId { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CurrentStep { get; set; } = string.Empty;
    public string CurrentAgent { get; set; } = string.Empty;
    public string Objective { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;

    public string ChatResponse { get; set; } = string.Empty;
    public bool ReadyToBuild { get; set; }

    public List<AgentPlanStep> Plan { get; set; } = new();
    public AgentBuildSummary? Build { get; set; }
    public JsonElement? Analysis { get; set; }
    public JsonElement? Validation { get; set; }
    public JsonElement? CompletedSteps { get; set; }
    public List<string> Errors { get; set; } = new();
}
