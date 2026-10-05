using TechNest.Api.Dtos.OrderDto;

namespace TechNest.Api.Services.Interfaces
{
    public interface IOrderService
    {
        Task<List<OrderResponseDto>> GetAllOrders();

        Task<PagedOrderResponseDto> GetOrdersByUserId(
            int userId,
            int page = 1,
            int pageSize = 10
        );

        Task<OrderResponseDto?> GetOrderById(int id);

        Task<OrderResponseDto> CreateOrder(
            CreateOrderDto dto
        );

        Task<OrderResponseDto> CreatePcBuildOrder(
            int userId,
            CreatePcBuildOrderDto dto
        );

        Task<OrderResponseDto> CreatePcBuildRequestOrder(
            int userId,
            CreatePcBuildRequestOrderDto dto
        );

        Task<bool> UpdateOrderStatus(
            int id,
            string newStatus,
            string? trackingNumber = null
        );

        Task<bool> CancelOrder(int id);

        Task<PagedOrderResponseDto> GetAllOrdersPaged(
            int page = 1,
            int pageSize = 10
        );

        Task<PagedOrderResponseDto> GetPcBuildOrdersByUserId(
    int userId,
    int page,
    int pageSize
);
    }
}