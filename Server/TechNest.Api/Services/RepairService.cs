using Microsoft.EntityFrameworkCore;
using TechNest.Api.Data;
using TechNest.Api.DTOs;
using TechNest.Api.Models;
using TechNest.Api.Services.Interfaces;
using static System.Net.Mime.MediaTypeNames;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
                ImageUrl = r.ImageUrl,
                Status = r.Status.ToString(),
                AiDiagnosticReport = r.AiDiagnosticReport,
                EstimatedCost = r.EstimatedCost,
                TechnicianId = r.TechnicianId,
                RepairServiceId = r.RepairServiceId,
                AppointmentDate = r.AppointmentDate,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();
        }

        public async Task<RepairResponseDto?> GetRepairById(int id)
        {
            var r = await context.Repairs.FindAsync(id);

            if (r is null)
                return null;

            return new RepairResponseDto
            {
                Id = r.Id,
                CustomerId = r.CustomerId,
                DeviceModel = r.DeviceModel,
                IssueDescription = r.IssueDescription,
                ImageUrl = r.ImageUrl,
                Status = r.Status.ToString(),
                AiDiagnosticReport = r.AiDiagnosticReport,
                EstimatedCost = r.EstimatedCost,
                TechnicianId = r.TechnicianId,
                RepairServiceId = r.RepairServiceId,
                AppointmentDate = r.AppointmentDate,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            };
        }

        public async Task<RepairResponseDto> CreateRepair(CreateRepairDto repairDto)
        {
            var appointmentDateUtc = repairDto.AppointmentDate.Kind == DateTimeKind.Utc
                ? repairDto.AppointmentDate
                : repairDto.AppointmentDate.ToUniversalTime();

            var newRepair = new Repair
            {
                CustomerId = repairDto.CustomerId,
                DeviceModel = repairDto.DeviceModel,
                IssueDescription = repairDto.IssueDescription,
                ImageUrl = repairDto.ImageUrl,
                AppointmentDate = appointmentDateUtc,
                Status = RepairStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Repairs.Add(newRepair);

            await context.SaveChangesAsync();

            return await GetRepairById(newRepair.Id)
                ?? throw new Exception("Failed to retrieve created repair.");
        }

        public async Task<bool> UpdateRepairStatus(
            int id,
            UpdateRepairStatusDto updateDto)
        {
            var repair = await context.Repairs.FindAsync(id);

            if (repair is null)
                return false;

            repair.Status = updateDto.Status;

            if (updateDto.TechnicianId.HasValue)
            {
                repair.TechnicianId = updateDto.TechnicianId.Value;
            }

            repair.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return true;
        }

        public async Task<RepairResponseDto?> UpdateRepair(
            int id,
            CreateRepairDto repairDto)
        {
            var repair = await context.Repairs.FindAsync(id);

            if (repair is null)
                return null;

            var appointmentDateUtc = repairDto.AppointmentDate.Kind == DateTimeKind.Utc
                ? repairDto.AppointmentDate
                : repairDto.AppointmentDate.ToUniversalTime();

            repair.CustomerId = repairDto.CustomerId;
            repair.DeviceModel = repairDto.DeviceModel;
            repair.IssueDescription = repairDto.IssueDescription;
            repair.ImageUrl = repairDto.ImageUrl;
            repair.AppointmentDate = appointmentDateUtc;
            repair.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return await GetRepairById(repair.Id);
        }

        public async Task<bool> DeleteRepair(int id)
        {
            var repair = await context.Repairs.FindAsync(id);

            if (repair is null)
                return false;

            context.Repairs.Remove(repair);

            await context.SaveChangesAsync();

            return true;
        }

        public async Task<List<RepairResponseDto>> GetRepairsByCustomerId(string customerId)
        {
            var repairs = await context.Repairs
                .Where(r => r.CustomerId == customerId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return repairs.Select(r => new RepairResponseDto
            {
                Id = r.Id,
                CustomerId = r.CustomerId,
                DeviceModel = r.DeviceModel,
                IssueDescription = r.IssueDescription,
                ImageUrl = r.ImageUrl,
                Status = r.Status.ToString(),
                AiDiagnosticReport = r.AiDiagnosticReport,
                EstimatedCost = r.EstimatedCost,
                TechnicianId = r.TechnicianId,
                RepairServiceId = r.RepairServiceId,
                AppointmentDate = r.AppointmentDate,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            }).ToList();
        }
    }
}