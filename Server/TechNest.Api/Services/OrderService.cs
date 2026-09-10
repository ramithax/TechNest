using Microsoft.EntityFrameworkCore;
using TechNest.Api.Data;
using TechNest.Api.Dtos.OrderDto;
using TechNest.Api.Models;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services
{
    public class OrderService(AppDbContext context) : IOrderService
    {
        public async Task<List<OrderResponseDto>> GetAllOrders()
        {
            return await context.Orders
                .Include(o => o.Items)
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
                    AdminNotes = o.AdminNotes,
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

        public async Task<OrderResponseDto?> GetOrderById(int id)
        {
            return await context.Orders
                .Include(o => o.Items)
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
                    AdminNotes = o.AdminNotes,
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

        public async Task<OrderResponseDto> CreateOrder(CreateOrderDto dto)
        {
            var productIds = dto.Items.Select(i => i.ProductId).ToList();
            var products = await context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            var orderItems = new List<OrderItem>();
            decimal calculatedTotal = 0;

            foreach (var itemDto in dto.Items)
            {
                if (!products.TryGetValue(itemDto.ProductId, out var product))
                {
                    throw new InvalidOperationException($"Product with ID {itemDto.ProductId} was not found.");
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
                AdminNotes = newOrder.AdminNotes,
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

        public async Task<bool> UpdateOrderStatus(int id, string newStatus, string? trackingNumber = null, string? adminNotes = null)
        {
            var order = await context.Orders.FindAsync(id);
            if (order is null) return false;

            order.Status = newStatus;
            if (!string.IsNullOrWhiteSpace(trackingNumber))
            {
                order.TrackingNumber = trackingNumber;
            }
            if (!string.IsNullOrWhiteSpace(adminNotes))
            {
                order.AdminNotes = adminNotes;
            }
            order.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CancelOrder(int id)
        {
            var order = await context.Orders.FindAsync(id);
            if (order is null) return false;

            order.Status = "Cancelled";
            order.UpdatedAt = DateTime.UtcNow;

            await context.SaveChangesAsync();
            return true;
        }
    }
}
