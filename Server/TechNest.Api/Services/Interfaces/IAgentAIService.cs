using TechNest.Api.Dtos.AgentDto;

namespace TechNest.Api.Services.Interfaces;

public interface IAgentAIService
{
    Task<AgentWorkflowResponse?> StartWorkflowAsync(
        int userId,
        string objective,
        List<AgentConversationMessage> conversation
    );
}

