namespace TechNest.Api.Models.PcBuildRequest;

public class PcBuildRequestItem
{
    public int Id { get; set; }

    public int PcBuildRequestId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; } = 1;

    public decimal UnitPrice { get; set; }

    public string? Reason { get; set; }

    public PcBuildRequest PcBuildRequest { get; set; } = null!;

    public Product Product { get; set; } = null!;
}