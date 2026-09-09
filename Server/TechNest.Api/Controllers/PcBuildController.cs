using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Dtos.PcBuilderDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PcBuildController(IPcBuildService service) : ControllerBase
    {
        // POST: api/PcBuild
        [HttpPost]
        public async Task<ActionResult<PcBuildDto>> CreateBuild()
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized();

            var build = await service.CreateBuild(userId.Value);

            return Ok(build);
        }


        // GET: api/PcBuild/{buildId}
        [HttpGet("{buildId:int}")]
        public async Task<ActionResult<PcBuildDto>> GetBuild(int buildId)
        {
            var userId = GetUserId();

            if (userId == null)
                return Unauthorized();

            var build = await service.GetBuild(
                buildId,
                userId.Value);

            if (build == null)
                return NotFound("PC build not found.");

            return Ok(build);
        }


        // POST: api/PcBuild/{buildId}/items
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
                    return NotFound("PC build not found.");

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


        // PUT: api/PcBuild/{buildId}/items/{itemId}
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


        // DELETE: api/PcBuild/{buildId}/items/{itemId}
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
                return NotFound(
                    "PC build or build item not found.");

            return NoContent();
        }


        // GET: api/PcBuild/{buildId}/summary
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
                return NotFound("PC build not found.");

            return Ok(summary);
        }


        // Get logged-in user's ID from JWT
        private int? GetUserId()
        {
            var claim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier);

            if (claim == null)
                return null;

            if (!int.TryParse(claim.Value, out var userId))
                return null;

            return userId;
        }
    }
}