using TechNest.Api.DTOs;

namespace TechNest.Api.Services
{
    public interface IRepairService
    {
        Task<List<RepairResponseDto>> GetAllRepairs();
        Task<RepairResponseDto?> GetRepairById(int id);
        Task<RepairResponseDto> CreateRepair(CreateRepairDto repairDto);
        Task<bool> UpdateRepairStatus(int id, UpdateRepairStatusDto updateDto);
    }
}