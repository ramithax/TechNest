using TechNest.Api.Dtos.AgentDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services;

public class AgentWorkflowService(IAgentAIService agentClient)
    : IAgentWorkflowService
{
    public Task<AgentWorkflowResponse?> StartAsync(
        int userId,
        string objective,
        List<AgentConversationMessage> conversation)
    {
        return agentClient.StartWorkflowAsync(
            userId,
            objective,
            conversation
        );
    }
}
