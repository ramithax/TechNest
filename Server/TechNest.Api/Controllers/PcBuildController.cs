using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Dtos.PcBuilderDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PcBuildController(IPcBuildService service)
        : ControllerBase
    {
        // ==========================================
        // CUSTOMER
        // ==========================================

        // Create a new PC build
        [HttpPost]
        public async Task<ActionResult<PcBuildDto>> CreateBuild()
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized();

            var build = await service.CreateBuild(
                userId.Value);

            return Ok(build);
        }

        // Get PC build history
        [HttpGet("history")]
        public async Task<ActionResult<List<PcBuildHistoryDto>>>
            GetBuildHistory()
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized();

            return Ok(
                await service.GetBuildHistory(
                    userId.Value)
            );
        }

        // Get a specific PC build
        [HttpGet("{buildId:int}")]
        public async Task<ActionResult<PcBuildDto>> GetBuild(
            int buildId)
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized();

            var build = await service.GetBuild(
                buildId,
                userId.Value);

            if (build == null)
                return NotFound(
                    "PC build not found.");

            return Ok(build);
        }

        // Add product to PC build
        [HttpPost("{buildId:int}/items")]
        public async Task<ActionResult<BuildItemDto>> AddBuildItem(
            int buildId,
            BuildItemRequestDto request)
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized();

            try
            {
                var item = await service.AddBuildItem(
                    buildId,
                    userId.Value,
                    request);

                if (item == null)
                    return NotFound(
                        "PC build not found.");

                return Ok(item);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Update PC build item
        [HttpPut("{buildId:int}/items/{itemId:int}")]
        public async Task<ActionResult<BuildItemDto>> UpdateItem(
            int buildId,
            int itemId,
            BuildItemRequestDto request)
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized();

            try
            {
                var item = await service.UpdateBuildItem(
                    buildId,
                    itemId,
                    userId.Value,
                    request);

                if (item == null)
                    return NotFound(
                        "PC build or build item not found.");

                return Ok(item);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // Delete PC build item
        [HttpDelete("{buildId:int}/items/{itemId:int}")]
        public async Task<IActionResult> DeleteItem(
            int buildId,
            int itemId)
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized();

            var deleted = await service.DeleteBuildItem(
                buildId,
                itemId,
                userId.Value);

            if (!deleted)
            {
                return NotFound(
                    "PC build or build item not found.");
            }

            return NoContent();
        }

        // Get build summary
        [HttpGet("{buildId:int}/summary")]
        public async Task<ActionResult<BuildSummaryDto>> GetSummary(
            int buildId)
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized();

            var summary = await service.GetSummary(
                buildId,
                userId.Value);

            if (summary == null)
                return NotFound(
                    "PC build not found.");

            return Ok(summary);
        }

        // ==========================================
        // ADMIN
        // ==========================================

        // Get all PC builds
        [HttpGet("admin")]
        public async Task<IActionResult> GetAllBuilds(
     [FromQuery] int page = 1,
     [FromQuery] int pageSize = 10)
        {
            var builds = await service.GetAllBuilds(page, pageSize);

            return Ok(builds);
        }

        // Get a specific PC build
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/{buildId:int}")]
        public async Task<ActionResult<PcBuildDto>>
            GetAdminBuild(int buildId)
        {
            var build = await service.GetBuildById(
                buildId);

            if (build == null)
                return NotFound(
                    "PC build not found.");

            return Ok(build);
        }

        // ==========================================
        // HELPERS
        // ==========================================

        // Get authenticated user ID
        private int? GetUserId()
        {
            var claim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (claim == null)
                return null;

            return int.TryParse(
                claim.Value,
                out var userId)
                ? userId
                : null;
        }
    }
}