using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Services;
using TechNest.Api.DTOs;

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
    }
}