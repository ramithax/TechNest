using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Dtos.OrderDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController(IOrderService service) : ControllerBase
    {
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<OrderResponseDto>>> GetOrders()
        {
            return Ok(await service.GetAllOrders());
        }

        [Authorize]
        [HttpGet("my-orders")]
        public async Task<ActionResult<PagedOrderResponseDto>> GetMyOrders(
            int page = 1,
            int pageSize = 10)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid user authentication.");
            }

            var result = await service.GetOrdersByUserId(
                userId,
                page,
                pageSize
            );

            return Ok(result);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponseDto>> GetOrderById(int id)
        {
            var order = await service.GetOrderById(id);

            if (order is null)
            {
                return NotFound("Order not found");
            }

            return Ok(order);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder(CreateOrderDto order)
        {
            try
            {
                var createdOrder = await service.CreateOrder(order);

                return CreatedAtAction(
                    nameof(GetOrderById),
                    new { id = createdOrder.Id },
                    createdOrder
                );
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateOrderStatus(
            int id,
            [FromBody] UpdateOrderStatusDto dto)
        {
            var updated = await service.UpdateOrderStatus(
                id,
                dto.Status,
                dto.TrackingNumber
            );

            return updated
                ? NoContent()
                : NotFound("Order not found");
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult> CancelOrder(int id)
        {
            var cancelled = await service.CancelOrder(id);

            return cancelled
                ? NoContent()
                : NotFound("Order not found");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<PagedOrderResponseDto>> GetAdminOrders(
    int page = 1,
    int pageSize = 10)
        {
            var result = await service.GetAllOrdersPaged(page, pageSize);

            return Ok(result);
        }
    }
}