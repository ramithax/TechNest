using TechNest.Api.Models;
using TechNest.Api.DTOs;

namespace TechNest.Api.Services
{
    public interface IProductService
    {
        Task<List<ProductResponseDto>> GetAllProducts();

        Task<ProductResponseDto?> GetProductById(int id);

        Task<ProductResponseDto> CreateProduct(CreateProductDto dto);

        Task<bool> UpdateProduct(int id, UpdateProductDto dto);

        Task<bool> DeleteProduct(int id);
    }
}
