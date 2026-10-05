using TechNest.Api.Dtos.ProductDto;

namespace TechNest.Api.Dtos;

public class PagedProductResponseDto
{
    public List<ProductResponseDto> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
}