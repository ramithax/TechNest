namespace TechNest.Api.Models.PcBuildRequest;

public class PcBuildRequest
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string WorkflowId { get; set; } = string.Empty;

    public PcBuildRequestStatus Status { get; set; } =
        PcBuildRequestStatus.PendingApproval;

    public decimal Budget { get; set; }

    public decimal TotalAmount { get; set; }

    public string? CustomerNote { get; set; }

    public string? AdminComment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ApprovedAt { get; set; }

    public DateTime? PaidAt { get; set; }

    public User User { get; set; } = null!;

    public ICollection<PcBuildRequestItem> Items { get; set; } =
        new List<PcBuildRequestItem>();
}