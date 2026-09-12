namespace TechNest.Api.Models
{
    public class Technician
    {
        public int Id { get; set; }
        public required string FullName { get; set; }
        public required string Email { get; set; }
        public required string Specialization { get; set; }
        public bool IsAvailable { get; set; } = true;

        public ICollection<Repair> AssignedRepairs { get; set; } = new List<Repair>();
    }
}