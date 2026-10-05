using TechNest.Api.Dtos.AgentDto;

namespace TechNest.Api.Services.Interfaces;

public interface IAgentWorkflowService
{
    Task<AgentWorkflowResponse?> StartAsync(
        int userId,
        string objective,
        List<AgentConversationMessage> conversation
    );
}