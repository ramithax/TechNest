using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TechNest.Api.Dtos.PcBuildRequest;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PcBuildRequestController(
    IPcBuildRequestService service) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateRequest(
        CreatePcBuildRequestDto dto)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        try
        {
            var result = await service.CreateRequest(
                userId.Value,
                dto
            );

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRequest(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var result = await service.GetRequest(
            userId.Value,
            id
        );

        if (result == null)
        {
            return NotFound(new
            {
                message = "PC build request not found."
            });
        }

        return Ok(result);
    }

    [HttpGet("my-requests")]
    public async Task<IActionResult> GetMyRequests()
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var result = await service.GetMyRequests(
            userId.Value
        );

        return Ok(result);
    }

    private int? GetUserId()
    {
        var claim = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(claim, out var userId))
            return null;

        return userId;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin")]
    public async Task<IActionResult> GetAdminRequests()
    {
        var result = await service.GetAdminRequests();

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("admin/{id}")]
    public async Task<IActionResult> GetAdminRequest(int id)
    {
        var result = await service.GetAdminRequest(id);

        if (result == null)
        {
            return NotFound(new
            {
                message = "PC build request not found."
            });
        }

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveRequest(
        int id,
        [FromBody] PcBuildRequestDecisionDto dto)
    {
        try
        {
            var result = await service.ApproveRequest(
                id,
                dto.AdminComment
            );

            if (result == null)
            {
                return NotFound(new
                {
                    message = "PC build request not found."
                });
            }

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> RejectRequest(
        int id,
        [FromBody] PcBuildRequestDecisionDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.AdminComment))
            {
                return BadRequest(new
                {
                    message = "Admin comment is required when rejecting."
                });
            }

            var result = await service.RejectRequest(
                id,
                dto.AdminComment
            );

            if (result == null)
            {
                return NotFound(new
                {
                    message = "PC build request not found."
                });
            }

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> ChangeStatus(
        int id,
        [FromBody] PcBuildRequestStatusDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Status))
            {
                return BadRequest(new
                {
                    message = "Status is required."
                });
            }

            var result = await service.ChangeStatus(
                id,
                dto.Status,
                dto.AdminComment
            );

            if (result == null)
            {
                return NotFound(new
                {
                    message = "PC build request not found."
                });
            }

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}