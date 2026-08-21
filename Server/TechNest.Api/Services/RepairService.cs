using Microsoft.EntityFrameworkCore;
using TechNest.Api.Data;
using TechNest.Api.DTOs;
using TechNest.Api.Models;

namespace TechNest.Api.Services
{
	public class RepairService(AppDbContext context) : IRepairService
	{
		public async Task<List<RepairResponseDto>> GetAllRepairs()
		{
			var repairs = await context.Repairs.ToListAsync();
			return repairs.Select(r => new RepairResponseDto
			{
				Id = r.Id,
				CustomerId = r.CustomerId,
				DeviceModel = r.DeviceModel,
				IssueDescription = r.IssueDescription,
				Status = r.Status.ToString(),
				AiDiagnosticReport = r.AiDiagnosticReport,
				EstimatedCost = r.EstimatedCost,
				TechnicianId = r.TechnicianId,
				RepairServiceId = r.RepairServiceId,
				CreatedAt = r.CreatedAt,
				UpdatedAt = r.UpdatedAt
			}).ToList();
		}

		public async Task<RepairResponseDto?> GetRepairById(int id)
		{
			var r = await context.Repairs.FindAsync(id);
			if (r is null) return null;
			return new RepairResponseDto
			{
				Id = r.Id,
				CustomerId = r.CustomerId,
				DeviceModel = r.DeviceModel,
				IssueDescription = r.IssueDescription,
				Status = r.Status.ToString(),
				AiDiagnosticReport = r.AiDiagnosticReport,
				EstimatedCost = r.EstimatedCost,
				TechnicianId = r.TechnicianId,
				RepairServiceId = r.RepairServiceId,
				CreatedAt = r.CreatedAt,
				UpdatedAt = r.UpdatedAt
			};
		}

		public async Task<RepairResponseDto> CreateRepair(CreateRepairDto repairDto)
		{
			var newRepair = new Repair
			{
				CustomerId = repairDto.CustomerId,
				DeviceModel = repairDto.DeviceModel,
				IssueDescription = repairDto.IssueDescription,
				Status = RepairStatus.Pending,
				CreatedAt = DateTime.UtcNow,
				UpdatedAt = DateTime.UtcNow
			};
			context.Repairs.Add(newRepair);
			await context.SaveChangesAsync();
			return await GetRepairById(newRepair.Id) ?? throw new Exception("Failed to retrieve created repair.");
		}

		public async Task<bool> UpdateRepairStatus(int id, UpdateRepairStatusDto updateDto)
		{
			var repair = await context.Repairs.FindAsync(id);
			if (repair is null) return false;
			repair.Status = updateDto.Status;
			if (updateDto.TechnicianId.HasValue) repair.TechnicianId = updateDto.TechnicianId.Value;
			repair.UpdatedAt = DateTime.UtcNow;
			await context.SaveChangesAsync();
			return true;
		}
	}
}