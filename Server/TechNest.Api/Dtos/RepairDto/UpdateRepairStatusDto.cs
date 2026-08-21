using TechNest.Api.Models;

namespace TechNest.Api.DTOs
{
    public class UpdateRepairStatusDto
    {
        public RepairStatus Status { get; set; }
        public int? TechnicianId { get; set; }
    }
}