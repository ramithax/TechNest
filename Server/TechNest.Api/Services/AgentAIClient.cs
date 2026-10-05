using System.Net.Http.Json;
using System.Text.Json;
using TechNest.Api.Dtos.AgentDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services;

public class AgentAIClient(HttpClient httpClient) : IAgentAIService
{
    private static readonly JsonSerializerOptions AgentJsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true,
    };

    public async Task<AgentWorkflowResponse?> StartWorkflowAsync(
        int userId,
        string objective,
        List<AgentConversationMessage> conversation)
    {
        var request = new
        {
            user_id = userId,
            objective = objective,
            conversation = conversation
        };

        Console.WriteLine("[AGENT] Sending request to Python:");
        Console.WriteLine(
            JsonSerializer.Serialize(request, AgentJsonOptions)
        );

        var response = await httpClient.PostAsJsonAsync(
            "/api/agent/workflow",
            request,
            AgentJsonOptions
        );

        Console.WriteLine(
            $"[AGENT] Python status: {(int)response.StatusCode}"
        );

        var responseBody = await response.Content.ReadAsStringAsync();

        Console.WriteLine("[AGENT] Python response:");
        Console.WriteLine(responseBody);

        response.EnsureSuccessStatusCode();

        return JsonSerializer.Deserialize<AgentWorkflowResponse>(
            responseBody,
            AgentJsonOptions
        );
    }
}
