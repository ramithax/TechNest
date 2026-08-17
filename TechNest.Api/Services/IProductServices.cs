using TechNest.Api.Models;

namespace TechNest.Api.Services
{
    public interface IProductServices
    {

        Task<List<Product>> GetAllProducts();

        Task<Product> GetProductById(int id);

        Task<Product> CreateProduct(Product product);
    }
}
