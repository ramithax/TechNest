namespace TechNest.Api.DTOs
{
    public class RepairResponseDto
    {
        public int Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public string DeviceModel { get; set; } = string.Empty;
        public string IssueDescription { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? AiDiagnosticReport { get; set; }
        public decimal EstimatedCost { get; set; }
        public int? TechnicianId { get; set; }
        public int? RepairServiceId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}