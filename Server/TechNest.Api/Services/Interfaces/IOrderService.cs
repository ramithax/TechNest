using TechNest.Api.Dtos.OrderDto;

namespace TechNest.Api.Services.Interfaces
{
    public interface IOrderService
    {
        Task<List<OrderResponseDto>> GetAllOrders();

        Task<OrderResponseDto?> GetOrderById(int id);

        Task<OrderResponseDto> CreateOrder(CreateOrderDto dto);

        Task<bool> UpdateOrderStatus(int id, string newStatus, string? trackingNumber = null);

        Task<bool> CancelOrder(int id);
    }
}
