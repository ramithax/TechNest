using System.ComponentModel.DataAnnotations;

namespace TechNest.Api.Dtos.PcBuilderDto
{
    public class BuildItemRequestDto
    {
        [Required]
        public int ProductId {get; set;}

        [Range(1, int.MaxValue)]
        public int Quantity {get;set;} = 1;
    }
}