using System.ComponentModel.DataAnnotations;

namespace TechNest.Api.Dtos.AgentDto;

public class StartAgentWorkflowRequest
{
    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Objective { get; set; } = string.Empty;

    public List<AgentConversationMessage> Conversation { get; set; } = new();
}