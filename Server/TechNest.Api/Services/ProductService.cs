using Microsoft.EntityFrameworkCore;
using TechNest.Api.Data;
using TechNest.Api.Models;
using TechNest.Api.Dtos;
using TechNest.Api.Dtos.ProductDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services
{
    public class ProductService(AppDbContext context) : IProductService
    {
        public async Task<PagedProductResponseDto> GetAllProducts(
    int page,
    int pageSize,
    bool includeInactive = false,
    string? search = null,
    string? category = null)
        {
            var query = context.Products.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(p => p.IsActive);
            }

            search = search?.Trim();
            category = category?.Trim();

            // Category filter
            if (!string.IsNullOrWhiteSpace(category))
            {
                query = query.Where(p =>
                    EF.Functions.ILike(p.Category, category));
            }

            // Search filter
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(p =>
                    EF.Functions.ILike(p.Name, $"%{search}%") ||
                    EF.Functions.ILike(p.Brand, $"%{search}%") ||
                    EF.Functions.ILike(p.Description, $"%{search}%"));
            }

            var totalCount = await query.CountAsync();

            var totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize
            );

            IQueryable<Product> orderedQuery;

            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchPattern = $"%{search}%";

                orderedQuery = query
                    .OrderByDescending(p =>
                        EF.Functions.ILike(p.Name, search) ? 4 :
                        EF.Functions.ILike(p.Name, searchPattern) ? 3 :
                        EF.Functions.ILike(p.Brand, searchPattern) ? 2 :
                        EF.Functions.ILike(p.Description, searchPattern) ? 1 :
                        0)
                    .ThenByDescending(p => p.CreatedAt);
            }
            else
            {
                orderedQuery = query
                    .OrderByDescending(p => p.CreatedAt);
            }

            var products = await orderedQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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

            return new PagedProductResponseDto
            {
                Items = products,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasNextPage = page < totalPages
            };
        }

        public async Task<ProductResponseDto?> GetProductById(int id)
        {
            var result = await context.Products
                .Where(c => c.Id == id)
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

            if (exist is null)
                return false;

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

            if (product is null)
                return false;

            context.Products.Remove(product);
            await context.SaveChangesAsync();

            return true;
        }
    }
}