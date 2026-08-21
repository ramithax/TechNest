namespace TechNest.Api.Models
{
    public enum RepairStatus
    {
        Pending,
        Diagnosed,
        AwaitingApproval,
        InProgress,
        Completed,
        Cancelled
    }

    public class Repair
    {
        public int Id { get; set; }

        public required string CustomerId { get; set; }
        public required string DeviceModel { get; set; }
        public required string IssueDescription { get; set; }

        public RepairStatus Status { get; set; } = RepairStatus.Pending;
        public string? AiDiagnosticReport { get; set; }
        public decimal EstimatedCost { get; set; }

        public int? TechnicianId { get; set; }
        public Technician? Technician { get; set; }

        public int? RepairServiceId { get; set; }
        public RepairService? RepairService { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}