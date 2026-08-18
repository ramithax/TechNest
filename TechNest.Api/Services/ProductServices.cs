using System;
using System.Collections.Generic;
using System.Reflection.PortableExecutable;
using System.Threading.Tasks;
using TechNest.Api.Models;

namespace TechNest.Api.Services
{
    public class ProductServices : IProductServices
    {

        static List<Product> products = new List<Product>
{
    new Product
    {
        Id = 1,
        Name = "Laptop",
        ActualPrice = 150000
    },
    new Product
    {
        Id = 2,
        Name = "Keyboard",
        ActualPrice = 40000
    }
};

        public async Task<List<Product>> GetAllProducts()
        {
            return await Task.FromResult(products);
        }

        public async Task<Product?> GetProductById(int id)
        {
            var result = products.FirstOrDefault(p => p.Id == id);
            return await Task.FromResult(result);
        }

        public Task<Product> CreateProduct(Product product)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateProduct(int id, Product product)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteProduct(int id)
        {
            throw new NotImplementedException();
        }
    }
}
