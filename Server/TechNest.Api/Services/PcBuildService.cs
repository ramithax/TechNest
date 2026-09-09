using Microsoft.EntityFrameworkCore;
using TechNest.Api.Data;
using TechNest.Api.Models;
using TechNest.Api.Dtos.PcBuilderDto;
using TechNest.Api.Services.Interfaces;
using TechNest.Api.Models.PcBuilder;

namespace TechNest.Api.Services
{
    public class PcBuildService(AppDbContext context) : IPcBuildService
    {

        // Create a new PC build
        public async Task<PcBuildDto> CreateBuild(int userId)
        {
            var build = new PcBuild
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            context.PcBuilds.Add(build);
            await context.SaveChangesAsync();

            return new PcBuildDto
            {
                Id = build.Id,
                CreatedAt = build.CreatedAt,
                Items = new List<BuildItemDto>()
            };
        }


        // Get a PC build with its selected products
        public async Task<PcBuildDto?> GetBuild(int buildId, int userId)
        {
            var build = await context.PcBuilds
                .Include(b => b.BuildItems)
                .ThenInclude(bi => bi.Product)
                .FirstOrDefaultAsync(
                    b => b.Id == buildId &&
                        b.UserId == userId);

            if (build is null)
                return null;

            return new PcBuildDto
            {
                Id = build.Id,
                CreatedAt = build.CreatedAt,

                Items = build.BuildItems.Select(item => new BuildItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.Product.Name,
                    Category = item.Product.Category,
                    Brand = item.Product.Brand,
                    UnitPrice = item.Product.ActualPrice,
                    Quantity = item.Quantity,
                    TotalPrice =
                        item.Product.ActualPrice * item.Quantity,
                    Images = item.Product.Images

                }).ToList()
            };
        }


        // Add a product to the PC build
        public async Task<BuildItemDto?> AddBuildItem(int buildId, int userId, BuildItemRequestDto request)
        {
            var build = await context.PcBuilds
                .FirstOrDefaultAsync(
                    b => b.Id == buildId &&
                        b.UserId == userId);

            if (build is null)
                return null;


            var product = await context.Products
                .FirstOrDefaultAsync(
                    p => p.Id == request.ProductId &&
                        p.IsActive);

            if (product is null)
                throw new KeyNotFoundException(
                    "Product not found or inactive.");


            if (request.Quantity > product.StockQuantity)
                throw new InvalidOperationException(
                    "Requested quantity exceeds available stock.");


            // Check whether the product is already in the build
            var existingItem = await context.BuildItems
                .FirstOrDefaultAsync(
                    bi => bi.PcBuildId == buildId &&
                        bi.ProductId == request.ProductId);

            if (existingItem is not null)
            {
                var newQuantity =
                    existingItem.Quantity + request.Quantity;

                if (newQuantity > product.StockQuantity)
                    throw new InvalidOperationException(
                        "Requested quantity exceeds available stock.");

                existingItem.Quantity = newQuantity;
            }
            else
            {
                var buildItem = new BuildItem
                {
                    PcBuildId = buildId,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity
                };

                context.BuildItems.Add(buildItem);

                existingItem = buildItem;
            }

            await context.SaveChangesAsync();


            return new BuildItemDto
            {
                Id = existingItem.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                Category = product.Category,
                Brand = product.Brand,
                UnitPrice = product.ActualPrice,
                Quantity = existingItem.Quantity,
                TotalPrice =
                    product.ActualPrice *
                    existingItem.Quantity,
                Images = product.Images
            };
        }


        // Update/change a selected product
        public async Task<BuildItemDto?> UpdateBuildItem(int buildId, int itemId, int userId, BuildItemRequestDto request)
        {
            var build = await context.PcBuilds
                .FirstOrDefaultAsync(
                    b => b.Id == buildId &&
                        b.UserId == userId);

            if (build is null)
                return null;


            var buildItem = await context.BuildItems
                .FirstOrDefaultAsync(
                    bi => bi.Id == itemId &&
                        bi.PcBuildId == buildId);

            if (buildItem is null)
                return null;


            var product = await context.Products
                .FirstOrDefaultAsync(
                    p => p.Id == request.ProductId &&
                        p.IsActive);

            if (product is null)
                throw new KeyNotFoundException(
                    "Product not found or inactive.");


            if (request.Quantity > product.StockQuantity)
                throw new InvalidOperationException(
                    "Requested quantity exceeds available stock.");


            buildItem.ProductId = request.ProductId;
            buildItem.Quantity = request.Quantity;

            await context.SaveChangesAsync();


            return new BuildItemDto
            {
                Id = buildItem.Id,
                ProductId = product.Id,
                ProductName = product.Name,
                Category = product.Category,
                Brand = product.Brand,
                UnitPrice = product.ActualPrice,
                Quantity = buildItem.Quantity,
                TotalPrice =
                    product.ActualPrice *
                    buildItem.Quantity,
                Images = product.Images
            };
        }


        // Delete a selected product from the build
        public async Task<bool> DeleteBuildItem(
            int buildId,
            int itemId,
            int userId)
        {
            var build = await context.PcBuilds
                .FirstOrDefaultAsync(
                    b => b.Id == buildId &&
                        b.UserId == userId);

            if (build is null)
                return false;


            var buildItem = await context.BuildItems
                .FirstOrDefaultAsync(
                    bi => bi.Id == itemId &&
                        bi.PcBuildId == buildId);

            if (buildItem is null)
                return false;


            context.BuildItems.Remove(buildItem);

            await context.SaveChangesAsync();

            return true;
        }


        // Get the build summary
        public async Task<BuildSummaryDto?> GetSummary(
            int buildId,
            int userId)
        {
            var build = await context.PcBuilds
                .Include(b => b.BuildItems)
                .ThenInclude(bi => bi.Product)
                .FirstOrDefaultAsync(
                    b => b.Id == buildId &&
                        b.UserId == userId);

            if (build is null)
                return null;


            var items = build.BuildItems
                .Select(item => new BuildItemDto
                {
                    Id = item.Id,
                    ProductId = item.ProductId,
                    ProductName = item.Product.Name,
                    Category = item.Product.Category,
                    Brand = item.Product.Brand,
                    UnitPrice = item.Product.ActualPrice,
                    Quantity = item.Quantity,
                    TotalPrice =
                        item.Product.ActualPrice *
                        item.Quantity,
                    Images = item.Product.Images

                }).ToList();


            var totalPrice = items.Sum(
                item => item.TotalPrice);


            return new BuildSummaryDto
            {
                PcBuildId = build.Id,
                Items = items,
                TotalPrice = totalPrice
            };
        }
    }
}
