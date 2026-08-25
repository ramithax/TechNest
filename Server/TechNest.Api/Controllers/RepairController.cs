using Microsoft.AspNetCore.Mvc;
using TechNest.Api.DTOs;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RepairController(IRepairService service) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<RepairResponseDto>>> GetRepairs()
        {
            return Ok(await service.GetAllRepairs());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RepairResponseDto>> GetRepairById(int id)
        {
            var repair = await service.GetRepairById(id);
            return repair is null ? NotFound("Repair ticket not found") : Ok(repair);
        }

        [HttpPost]
        public async Task<IActionResult> CreateRepair(CreateRepairDto repairDto)
        {
            var createdRepair = await service.CreateRepair(repairDto);
            return CreatedAtAction(nameof(GetRepairById), new { id = createdRepair.Id }, createdRepair);
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateRepairStatus(int id, UpdateRepairStatusDto updateDto)
        {
            var updated = await service.UpdateRepairStatus(id, updateDto);
            return updated ? NoContent() : NotFound("Repair ticket not found");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRepair(int id, [FromBody] CreateRepairDto repairDto)
        {
            var result = await service.UpdateRepair(id, repairDto);
            if (result is null) return NotFound("Repair ticket not found.");
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRepair(int id)
        {
            var success = await service.DeleteRepair(id);
            if (!success) return NotFound("Repair ticket not found.");
            return NoContent();
        }
    }
}