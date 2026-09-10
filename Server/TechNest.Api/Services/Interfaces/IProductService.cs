using TechNest.Api.Models;
using TechNest.Api.DTOs;
using TechNest.Api.Dtos.ProductDto;

namespace TechNest.Api.Services.Interfaces
{
    public interface IProductService
    {
        Task<List<ProductResponseDto>> GetAllProducts(bool includeInactive = false);

        Task<ProductResponseDto?> GetProductById(int id);

        Task<ProductResponseDto> CreateProduct(CreateProductDto dto);

        Task<bool> UpdateProduct(int id, UpdateProductDto dto);

        Task<bool> DeleteProduct(int id);
    }
}
