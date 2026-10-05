using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Dtos.AgentDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class AgentController(IAgentWorkflowService workflows) : ControllerBase
{
    [HttpPost("workflow")]
    public async Task<IActionResult> StartWorkflow(
        [FromBody] StartAgentWorkflowRequest request)
    {
        if (!TryGetAuthenticatedUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await workflows.StartAsync(
            userId,
            request.Objective,
            request.Conversation
        );

        return response is null
            ? StatusCode(
                StatusCodes.Status502BadGateway,
                new
                {
                    message = "The agent service returned no workflow response."
                })
            : Ok(response);
    }

    private bool TryGetAuthenticatedUserId(out int userId) =>
        int.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier),
            out userId
        );
}
