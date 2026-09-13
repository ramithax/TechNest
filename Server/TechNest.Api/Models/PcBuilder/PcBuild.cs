namespace TechNest.Api.Models.PcBuilder
{
    public class PcBuild
    {
        public int Id {get; set;}
        public int UserId {get; set;}
        public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
        public User User{get; set;} = null!;
        public ICollection<BuildItem> BuildItems{get;set;} = new List<BuildItem>();
    }
}