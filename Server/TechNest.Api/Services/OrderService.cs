using Microsoft.EntityFrameworkCore;
using TechNest.Api.Data;
using TechNest.Api.Dtos.OrderDto;
using TechNest.Api.Models;
using TechNest.Api.Models.PcBuildRequest;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services
{
    public class OrderService(AppDbContext context) : IOrderService
    {
        public async Task<List<OrderResponseDto>> GetAllOrders()
        {
            return await context.Orders
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    CustomerName = o.CustomerName,
                    CustomerEmail = o.CustomerEmail,
                    ShippingAddress = o.ShippingAddress,
                    ContactNumber = o.ContactNumber,
                    OrderType = o.OrderType,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    TrackingNumber = o.TrackingNumber,
                    PcBuildId = o.PcBuildId,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity,
                        TotalPrice = i.TotalPrice
                    }).ToList()
                })
                .ToListAsync();
        }

        // ============================================================
        // CUSTOMER ORDERS
        // Only normal product orders are returned here.
        // CustomPC orders are handled separately.
        // ============================================================

        public async Task<PagedOrderResponseDto> GetOrdersByUserId(
            int userId,
            int page = 1,
            int pageSize = 10)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1 || pageSize > 50)
                pageSize = 10;

            // IMPORTANT:
            // Filter CustomPC orders BEFORE pagination.
            var query = context.Orders
                .Where(o =>
                    o.UserId == userId &&
                    o.OrderType != "CustomPC")
                .OrderByDescending(o => o.CreatedAt);

            var totalCount = await query.CountAsync();

            var totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize
            );

            var orders = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    CustomerName = o.CustomerName,
                    CustomerEmail = o.CustomerEmail,
                    ShippingAddress = o.ShippingAddress,
                    ContactNumber = o.ContactNumber,
                    OrderType = o.OrderType,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    TrackingNumber = o.TrackingNumber,
                    PcBuildId = o.PcBuildId,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity,
                        TotalPrice = i.TotalPrice
                    }).ToList()
                })
                .ToListAsync();

            return new PagedOrderResponseDto
            {
                Items = orders,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasNextPage = page < totalPages
            };
        }

        public async Task<OrderResponseDto?> GetOrderById(int id)
        {
            return await context.Orders
                .Where(o => o.Id == id)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    CustomerName = o.CustomerName,
                    CustomerEmail = o.CustomerEmail,
                    ShippingAddress = o.ShippingAddress,
                    ContactNumber = o.ContactNumber,
                    OrderType = o.OrderType,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    TrackingNumber = o.TrackingNumber,
                    PcBuildId = o.PcBuildId,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity,
                        TotalPrice = i.TotalPrice
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        // ============================================================
        // NORMAL PRODUCT ORDER
        // ============================================================

        public async Task<OrderResponseDto> CreateOrder(CreateOrderDto dto)
        {
            var productIds = dto.Items
                .Select(i => i.ProductId)
                .ToList();

            var products = await context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            var orderItems = new List<OrderItem>();

            decimal calculatedTotal = 0;

            foreach (var itemDto in dto.Items)
            {
                if (!products.TryGetValue(
                        itemDto.ProductId,
                        out var product))
                {
                    throw new InvalidOperationException(
                        $"Product with ID {itemDto.ProductId} was not found."
                    );
                }

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = product.ActualPrice,
                    Quantity = itemDto.Quantity
                };

                calculatedTotal += orderItem.TotalPrice;

                orderItems.Add(orderItem);
            }

            var newOrder = new Order
            {
                UserId = dto.UserId,
                CustomerName = dto.CustomerName,
                CustomerEmail = dto.CustomerEmail,
                ShippingAddress = dto.ShippingAddress,
                ContactNumber = dto.ContactNumber,
                OrderType = dto.OrderType,
                Status = "Pending",
                TotalAmount = calculatedTotal,
                Items = orderItems,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Orders.Add(newOrder);

            await context.SaveChangesAsync();

            return new OrderResponseDto
            {
                Id = newOrder.Id,
                UserId = newOrder.UserId,
                CustomerName = newOrder.CustomerName,
                CustomerEmail = newOrder.CustomerEmail,
                ShippingAddress = newOrder.ShippingAddress,
                ContactNumber = newOrder.ContactNumber,
                OrderType = newOrder.OrderType,
                Status = newOrder.Status,
                TotalAmount = newOrder.TotalAmount,
                TrackingNumber = newOrder.TrackingNumber,
                PcBuildId = newOrder.PcBuildId,
                CreatedAt = newOrder.CreatedAt,
                UpdatedAt = newOrder.UpdatedAt,
                Items = newOrder.Items.Select(i => new OrderItemResponseDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    TotalPrice = i.TotalPrice
                }).ToList()
            };
        }

        // ============================================================
        // AI AGENT BUILDER
        // PcBuildRequest -> Payment -> Order
        // ============================================================

        public async Task<OrderResponseDto> CreatePcBuildRequestOrder(
            int userId,
            CreatePcBuildRequestOrderDto dto)
        {
            var request = await context.PcBuildRequests
                .Include(r => r.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(r =>
                    r.Id == dto.PcBuildRequestId &&
                    r.UserId == userId
                );

            if (request is null)
            {
                throw new InvalidOperationException(
                    "PC build request was not found or does not belong to the current user."
                );
            }

            if (request.Status != PcBuildRequestStatus.PaymentPending)
            {
                throw new InvalidOperationException(
                    "This AI PC build is not ready for payment."
                );
            }

            if (!request.Items.Any())
            {
                throw new InvalidOperationException(
                    "AI PC build request does not contain any products."
                );
            }

            decimal calculatedTotal = 0;

            var orderItems = new List<OrderItem>();

            foreach (var requestItem in request.Items)
            {
                if (requestItem.Product is null)
                {
                    throw new InvalidOperationException(
                        $"Product with ID {requestItem.ProductId} was not found."
                    );
                }

                var product = requestItem.Product;

                if (!product.IsActive)
                {
                    throw new InvalidOperationException(
                        $"Product '{product.Name}' is no longer available."
                    );
                }

                if (product.StockQuantity < requestItem.Quantity)
                {
                    throw new InvalidOperationException(
                        $"Not enough stock for '{product.Name}'."
                    );
                }

                var unitPrice = product.ActualPrice;

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    ProductName = product.Name,
                    UnitPrice = unitPrice,
                    Quantity = requestItem.Quantity
                };

                calculatedTotal += orderItem.TotalPrice;

                orderItems.Add(orderItem);

                product.StockQuantity -= requestItem.Quantity;
            }

            var newOrder = new Order
            {
                UserId = userId,
                CustomerName = dto.CustomerName,
                CustomerEmail = dto.CustomerEmail,
                ShippingAddress = dto.ShippingAddress,
                ContactNumber = dto.ContactNumber,

                // AI Agent order
                OrderType = "CustomPC",

                Status = "Pending",
                TotalAmount = calculatedTotal,

                // AI Agent uses PcBuildRequest,
                // not the normal PcBuild.
                PcBuildId = null,

                Items = orderItems,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Orders.Add(newOrder);

            // Mark AI build request as paid.
            request.TotalAmount = calculatedTotal;
            request.Status = PcBuildRequestStatus.Paid;
            request.PaidAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return new OrderResponseDto
            {
                Id = newOrder.Id,
                UserId = newOrder.UserId,
                CustomerName = newOrder.CustomerName,
                CustomerEmail = newOrder.CustomerEmail,
                ShippingAddress = newOrder.ShippingAddress,
                ContactNumber = newOrder.ContactNumber,
                OrderType = newOrder.OrderType,
                Status = newOrder.Status,
                TotalAmount = newOrder.TotalAmount,
                TrackingNumber = newOrder.TrackingNumber,
                PcBuildId = newOrder.PcBuildId,
                CreatedAt = newOrder.CreatedAt,
                UpdatedAt = newOrder.UpdatedAt,

                Items = newOrder.Items.Select(i => new OrderItemResponseDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    UnitPrice = i.UnitPrice,
                    Quantity = i.Quantity,
                    TotalPrice = i.TotalPrice
                }).ToList()
            };
        }

        // ============================================================
        // NORMAL PC BUILDER
        // PcBuild -> Order
        // ============================================================

        public async Task<OrderResponseDto> CreatePcBuildOrder(
            int userId,
            CreatePcBuildOrderDto dto)
        {
            var build = await context.PcBuilds
                .Include(b => b.BuildItems)
                .ThenInclude(bi => bi.Product)
                .FirstOrDefaultAsync(b =>
                    b.Id == dto.PcBuildId &&
                    b.UserId == userId
                );

            if (build is null)
            {
                throw new InvalidOperationException(
                    "PC build was not found or does not belong to the current user."
                );
            }

            if (!build.BuildItems.Any())
            {
                throw new InvalidOperationException(
                    "PC build does not contain any products."
                );
            }

            decimal calculatedTotal = 0;

            foreach (var buildItem in build.BuildItems)
            {
                calculatedTotal +=
                    buildItem.Product.ActualPrice *
                    buildItem.Quantity;
            }

            var newOrder = new Order
            {
                UserId = userId,
                CustomerName = dto.CustomerName,
                CustomerEmail = dto.CustomerEmail,
                ShippingAddress = dto.ShippingAddress,
                ContactNumber = dto.ContactNumber,

                // Normal PC Builder
                OrderType = "CustomPC",

                Status = "Pending",
                TotalAmount = calculatedTotal,

                // Normal PcBuild ID
                PcBuildId = build.Id,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Orders.Add(newOrder);

            await context.SaveChangesAsync();

            return new OrderResponseDto
            {
                Id = newOrder.Id,
                UserId = newOrder.UserId,
                CustomerName = newOrder.CustomerName,
                CustomerEmail = newOrder.CustomerEmail,
                ShippingAddress = newOrder.ShippingAddress,
                ContactNumber = newOrder.ContactNumber,
                OrderType = newOrder.OrderType,
                Status = newOrder.Status,
                TotalAmount = newOrder.TotalAmount,
                TrackingNumber = newOrder.TrackingNumber,
                PcBuildId = newOrder.PcBuildId,
                CreatedAt = newOrder.CreatedAt,
                UpdatedAt = newOrder.UpdatedAt,

                Items = new List<OrderItemResponseDto>()
            };
        }

        // ============================================================
        // UPDATE ORDER STATUS
        // ============================================================

        public async Task<bool> UpdateOrderStatus(
            int id,
            string newStatus,
            string? trackingNumber = null)
        {
            var order = await context.Orders.FindAsync(id);

            if (order is null)
                return false;

            order.Status = newStatus;
            order.TrackingNumber = trackingNumber;
            order.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return true;
        }

        // ============================================================
        // CANCEL ORDER
        // ============================================================

        public async Task<bool> CancelOrder(int id)
        {
            var order = await context.Orders.FindAsync(id);

            if (order is null)
                return false;

            order.Status = "Cancelled";
            order.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();

            return true;
        }

        // ============================================================
        // ADMIN PAGINATED ORDERS
        // ============================================================

        public async Task<PagedOrderResponseDto> GetAllOrdersPaged(
            int page = 1,
            int pageSize = 10)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1 || pageSize > 50)
                pageSize = 10;

            var query = context.Orders
                .OrderByDescending(o => o.CreatedAt);

            var totalCount = await query.CountAsync();

            var totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize
            );

            var orders = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    CustomerName = o.CustomerName,
                    CustomerEmail = o.CustomerEmail,
                    ShippingAddress = o.ShippingAddress,
                    ContactNumber = o.ContactNumber,
                    OrderType = o.OrderType,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    TrackingNumber = o.TrackingNumber,
                    PcBuildId = o.PcBuildId,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity,
                        TotalPrice = i.TotalPrice
                    }).ToList()
                })
                .ToListAsync();

            return new PagedOrderResponseDto
            {
                Items = orders,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasNextPage = page < totalPages
            };
        }

        public async Task<PagedOrderResponseDto> GetPcBuildOrdersByUserId(
    int userId,
    int page = 1,
    int pageSize = 10)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1 || pageSize > 50)
                pageSize = 10;

            var query = context.Orders
                .Where(o =>
                    o.UserId == userId &&
                    o.OrderType == "CustomPC" &&
                    o.PcBuildId != null)
                .OrderByDescending(o => o.CreatedAt);

            var totalCount = await query.CountAsync();

            var totalPages = (int)Math.Ceiling(
                totalCount / (double)pageSize
            );

            var orders = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderResponseDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    CustomerName = o.CustomerName,
                    CustomerEmail = o.CustomerEmail,
                    ShippingAddress = o.ShippingAddress,
                    ContactNumber = o.ContactNumber,
                    OrderType = o.OrderType,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    TrackingNumber = o.TrackingNumber,
                    PcBuildId = o.PcBuildId,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,

                    Items = o.Items.Select(i => new OrderItemResponseDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        UnitPrice = i.UnitPrice,
                        Quantity = i.Quantity,
                        TotalPrice = i.TotalPrice
                    }).ToList()
                })
                .ToListAsync();

            return new PagedOrderResponseDto
            {
                Items = orders,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasNextPage = page < totalPages
            };
        }
    }

}