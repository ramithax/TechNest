namespace TechNest.Api.DTOs
{
	public class CreateRepairDto
	{
		public required string CustomerId { get; set; }
		public required string DeviceModel { get; set; }
		public required string IssueDescription { get; set; }
	}
}