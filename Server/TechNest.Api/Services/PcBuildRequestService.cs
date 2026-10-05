using Microsoft.EntityFrameworkCore;
using TechNest.Api.Data;
using TechNest.Api.Dtos.PcBuildRequest;
using TechNest.Api.Models.PcBuildRequest;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services;

public class PcBuildRequestService(AppDbContext context)
    : IPcBuildRequestService
{
    public async Task<object> CreateRequest(
        int userId,
        CreatePcBuildRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.WorkflowId))
            throw new ArgumentException("WorkflowId is required.");

        if (dto.Budget <= 0)
            throw new ArgumentException(
                "Budget must be greater than zero.");

        if (dto.Items == null || dto.Items.Count == 0)
            throw new ArgumentException(
                "At least one product is required.");

        if (dto.Items.Any(x => x.Quantity <= 0))
            throw new ArgumentException(
                "Product quantity must be greater than zero.");

        var productIds = dto.Items
            .Select(x => x.ProductId)
            .Distinct()
            .ToList();

        var products = await context.Products
            .Where(x => productIds.Contains(x.Id))
            .ToListAsync();

        if (products.Count != productIds.Count)
        {
            var foundIds = products
                .Select(x => x.Id)
                .ToHashSet();

            var missingIds = productIds
                .Where(id => !foundIds.Contains(id))
                .ToList();

            throw new ArgumentException(
                $"Products not found: {string.Join(", ", missingIds)}");
        }

        var unavailableProducts = products
            .Where(x => !x.IsActive || x.StockQuantity <= 0)
            .ToList();

        if (unavailableProducts.Count > 0)
        {
            var names = string.Join(
                ", ",
                unavailableProducts.Select(x => x.Name)
            );

            throw new ArgumentException(
                $"Unavailable products: {names}");
        }

        var productDictionary = products.ToDictionary(
            x => x.Id
        );

        decimal totalAmount = 0;

        foreach (var item in dto.Items)
        {
            var product = productDictionary[item.ProductId];

            if (item.Quantity > product.StockQuantity)
            {
                throw new ArgumentException(
                    $"Insufficient stock for {product.Name}. " +
                    $"Available: {product.StockQuantity}, " +
                    $"Requested: {item.Quantity}");
            }

            totalAmount +=
                product.ActualPrice * item.Quantity;
        }

        totalAmount = Math.Round(totalAmount, 2);

        if (totalAmount > dto.Budget)
        {
            throw new ArgumentException(
                $"Build exceeds budget. " +
                $"Budget: Rs. {dto.Budget:N2}, " +
                $"Total: Rs. {totalAmount:N2}");
        }

        var request = new PcBuildRequest
        {
            UserId = userId,
            WorkflowId = dto.WorkflowId,
            Status = PcBuildRequestStatus.PendingApproval,
            Budget = dto.Budget,
            TotalAmount = totalAmount,
            CustomerNote = dto.CustomerNote,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in dto.Items)
        {
            var product = productDictionary[item.ProductId];

            request.Items.Add(
                new PcBuildRequestItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.ActualPrice,
                    Reason = item.Reason
                }
            );
        }

        context.PcBuildRequests.Add(request);

        await context.SaveChangesAsync();

        return new
        {
            request.Id,
            request.WorkflowId,
            request.Status,
            request.Budget,
            request.TotalAmount,
            request.CustomerNote,
            request.CreatedAt,
            Items = request.Items.Select(item => new
            {
                item.Id,
                item.ProductId,
                item.Quantity,
                item.UnitPrice,
                item.Reason
            })
        };
    }

    public async Task<object?> GetRequest(
        int userId,
        int id)
    {
        var request = await context.PcBuildRequests
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(
                x => x.Id == id &&
                     x.UserId == userId
            );

        if (request == null)
            return null;

        return new
        {
            request.Id,
            request.WorkflowId,
            request.Status,
            request.Budget,
            request.TotalAmount,
            request.CustomerNote,
            request.AdminComment,
            request.CreatedAt,
            request.ApprovedAt,
            request.PaidAt,

            Items = request.Items.Select(item => new
            {
                item.Id,
                item.ProductId,
                item.Quantity,
                item.UnitPrice,
                item.Reason,
                ProductName = item.Product.Name,
                ProductCategory = item.Product.Category,
                ProductBrand = item.Product.Brand
            })
        };
    }

    public async Task<List<object>> GetMyRequests(
       int userId)
    {
        return await context.PcBuildRequests
            .Where(x => x.UserId == userId)
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.WorkflowId,
                x.Status,
                x.Budget,
                x.TotalAmount,
                x.CustomerNote,
                x.AdminComment,
                x.CreatedAt,
                x.ApprovedAt,
                x.PaidAt,

                ItemCount = x.Items.Count,

                Items = x.Items.Select(item => new
                {
                    item.Id,
                    item.ProductId,
                    item.Quantity,
                    item.UnitPrice,
                    item.Reason,
                    ProductName = item.Product.Name,
                    ProductCategory = item.Product.Category,
                    ProductBrand = item.Product.Brand
                })
            })
            .Cast<object>()
            .ToListAsync();
    }

    public async Task<List<object>> GetAdminRequests()
    {
        return await context.PcBuildRequests
            .Include(x => x.User)
            .Include(x => x.Items)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.WorkflowId,
                x.Status,
                x.Budget,
                x.TotalAmount,
                x.CustomerNote,
                x.AdminComment,
                x.CreatedAt,
                x.ApprovedAt,
                x.PaidAt,
                UserId = x.UserId,
                CustomerName = x.User.Name,
                CustomerEmail = x.User.Email,
                ItemCount = x.Items.Count
            })
            .Cast<object>()
            .ToListAsync();
    }

    public async Task<object?> GetAdminRequest(int id)
    {
        var request = await context.PcBuildRequests
            .Include(x => x.User)
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (request == null)
            return null;

        return new
        {
            request.Id,
            request.WorkflowId,
            request.Status,
            request.Budget,
            request.TotalAmount,
            request.CustomerNote,
            request.AdminComment,
            request.CreatedAt,
            request.ApprovedAt,
            request.PaidAt,

            Customer = new
            {
                request.UserId,
                request.User.Name,
                request.User.Email
            },

            Items = request.Items.Select(item => new
            {
                item.Id,
                item.ProductId,
                item.Quantity,
                item.UnitPrice,
                item.Reason,
                ProductName = item.Product.Name,
                ProductCategory = item.Product.Category,
                ProductBrand = item.Product.Brand,
                ProductStock = item.Product.StockQuantity,
                ProductActive = item.Product.IsActive
            })
        };
    }

    public async Task<object?> ApproveRequest(
        int id,
        string? adminComment)
    {
        var request = await context.PcBuildRequests
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (request == null)
            return null;

        if (request.Status != PcBuildRequestStatus.PendingApproval)
        {
            throw new ArgumentException(
                "Only pending PC build requests can be approved."
            );
        }

        foreach (var item in request.Items)
        {
            if (!item.Product.IsActive)
            {
                throw new ArgumentException(
                    $"Product '{item.Product.Name}' is no longer active."
                );
            }

            if (item.Product.StockQuantity < item.Quantity)
            {
                throw new ArgumentException(
                    $"Insufficient stock for '{item.Product.Name}'. " +
                    $"Available: {item.Product.StockQuantity}, " +
                    $"Required: {item.Quantity}"
                );
            }
        }

        var currentTotal = request.Items.Sum(
            x => x.Product.ActualPrice * x.Quantity
        );

        currentTotal = Math.Round(currentTotal, 2);

        if (currentTotal > request.Budget)
        {
            throw new ArgumentException(
                $"The current build price exceeds the customer's budget. " +
                $"Budget: Rs. {request.Budget:N2}, " +
                $"Current total: Rs. {currentTotal:N2}"
            );
        }

        foreach (var item in request.Items)
        {
            item.UnitPrice = item.Product.ActualPrice;
        }

        request.TotalAmount = currentTotal;
        request.Status = PcBuildRequestStatus.PaymentPending;
        request.AdminComment = adminComment;
        request.ApprovedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return new
        {
            request.Id,
            request.WorkflowId,
            request.Status,
            request.Budget,
            request.TotalAmount,
            request.AdminComment,
            request.ApprovedAt
        };
    }

    public async Task<object?> RejectRequest(
        int id,
        string adminComment)
    {
        if (string.IsNullOrWhiteSpace(adminComment))
        {
            throw new ArgumentException(
                "A rejection reason is required."
            );
        }

        var request = await context.PcBuildRequests
            .FirstOrDefaultAsync(x => x.Id == id);

        if (request == null)
            return null;

        if (request.Status != PcBuildRequestStatus.PendingApproval)
        {
            throw new ArgumentException(
                "Only pending PC build requests can be rejected."
            );
        }

        request.Status = PcBuildRequestStatus.Rejected;
        request.AdminComment = adminComment;

        await context.SaveChangesAsync();

        return new
        {
            request.Id,
            request.WorkflowId,
            request.Status,
            request.AdminComment
        };


    }

    public async Task<object?> ChangeStatus(
     int id,
     string status,
     string? adminComment)
    {
        var request = await context.PcBuildRequests
            .Include(x => x.Items)
            .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (request == null)
            return null;

        if (!Enum.TryParse<PcBuildRequestStatus>(
                status,
                true,
                out var newStatus))
        {
            throw new ArgumentException(
                $"Invalid status: {status}");
        }

        // Admin "Approved" means:
        // approved and waiting for customer payment.
        if (newStatus == PcBuildRequestStatus.Approved)
        {
            foreach (var item in request.Items)
            {
                if (!item.Product.IsActive)
                {
                    throw new ArgumentException(
                        $"Product '{item.Product.Name}' is no longer active."
                    );
                }

                if (item.Product.StockQuantity < item.Quantity)
                {
                    throw new ArgumentException(
                        $"Insufficient stock for '{item.Product.Name}'. " +
                        $"Available: {item.Product.StockQuantity}, " +
                        $"Required: {item.Quantity}"
                    );
                }
            }

            var currentTotal = request.Items.Sum(
                x => x.Product.ActualPrice * x.Quantity
            );

            currentTotal = Math.Round(currentTotal, 2);

            if (currentTotal > request.Budget)
            {
                throw new ArgumentException(
                    $"The current build price exceeds the customer's budget. " +
                    $"Budget: Rs. {request.Budget:N2}, " +
                    $"Current total: Rs. {currentTotal:N2}"
                );
            }

            foreach (var item in request.Items)
            {
                item.UnitPrice = item.Product.ActualPrice;
            }

            request.TotalAmount = currentTotal;
            newStatus = PcBuildRequestStatus.PaymentPending;
        }

        request.Status = newStatus;

        if (!string.IsNullOrWhiteSpace(adminComment))
        {
            request.AdminComment = adminComment;
        }

        if (newStatus == PcBuildRequestStatus.PaymentPending &&
            request.ApprovedAt == null)
        {
            request.ApprovedAt = DateTime.UtcNow;
        }

        if (newStatus == PcBuildRequestStatus.Paid &&
            request.PaidAt == null)
        {
            request.PaidAt = DateTime.UtcNow;
        }

        await context.SaveChangesAsync();

        return new
        {
            request.Id,
            request.WorkflowId,
            request.Status,
            request.Budget,
            request.TotalAmount,
            request.AdminComment,
            request.CreatedAt,
            request.ApprovedAt,
            request.PaidAt
        };
    }
}