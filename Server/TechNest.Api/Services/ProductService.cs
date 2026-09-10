using Microsoft.EntityFrameworkCore;
using TechNest.Api.Data;
using TechNest.Api.Models;
using TechNest.Api.DTOs;
using TechNest.Api.Dtos.ProductDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services
{
    public class ProductService(AppDbContext context) : IProductService
    {
        public async Task<List<ProductResponseDto>> GetAllProducts(bool includeInactive = false)
        {
            var query = context.Products.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(p => p.IsActive);
            }

            return await query
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    LabelPrice = p.LabelPrice,
                    ActualPrice = p.ActualPrice,
                    StockQuantity = p.StockQuantity,
                    Category = p.Category,
                    Brand = p.Brand,
                    Images = p.Images,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<ProductResponseDto?> GetProductById(int id)
        {
            var result = await context.Products.Where(
                c => c.Id == id).
                Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    LabelPrice = p.LabelPrice,
                    ActualPrice = p.ActualPrice,
                    StockQuantity = p.StockQuantity,
                    Category = p.Category,
                    Brand = p.Brand,
                    Images = p.Images,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt
                })
                .FirstOrDefaultAsync();
            return result;
        }

        public async Task<ProductResponseDto> CreateProduct(CreateProductDto product)
        {
            var newproduct = new Product
            {
                Name = product.Name,
                Description = product.Description,
                LabelPrice = product.LabelPrice,
                ActualPrice = product.ActualPrice,
                StockQuantity = product.StockQuantity,
                Category = product.Category,
                Brand = product.Brand,
                Images = product.Images,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow

            };
            context.Products.Add(newproduct);
            await context.SaveChangesAsync();

            return new ProductResponseDto
            {
                Id = newproduct.Id,
                Name = newproduct.Name,
                Description = newproduct.Description,
                LabelPrice = newproduct.LabelPrice,
                ActualPrice = newproduct.ActualPrice,
                StockQuantity = newproduct.StockQuantity,
                Category = newproduct.Category,
                Brand = newproduct.Brand,
                Images = newproduct.Images,
                IsActive = newproduct.IsActive,
                CreatedAt = newproduct.CreatedAt,
                UpdatedAt = newproduct.UpdatedAt
            };
        }

        public async Task<bool> UpdateProduct(int id, UpdateProductDto product)
        {
            var exist = await context.Products.FindAsync(id);

            if (exist is null) return false;

            exist.Name = product.Name;
            exist.Description = product.Description;
            exist.LabelPrice = product.LabelPrice;
            exist.ActualPrice = product.ActualPrice;
            exist.StockQuantity = product.StockQuantity;
            exist.Category = product.Category;
            exist.Brand = product.Brand;
            exist.Images = product.Images;
            exist.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteProduct(int id)
        {
            var product = await context.Products.FindAsync(id);
            if (product is null) return false;

            context.Products.Remove(product);
            await context.SaveChangesAsync();
            return true;
        }
    }
}
