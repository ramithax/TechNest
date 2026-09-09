namespace TechNest.Api.Models.PcBuilder
{
    public class BuildItem
    {
        public int Id {get; set;}
        public int PcBuildId {get; set;}
        public int ProductId {get; set;}
        public int Quantity { get; set; }
        public PcBuild PcBuild{get; set;} = null!;
        public Product Product{get; set;} = null!;

    }
}