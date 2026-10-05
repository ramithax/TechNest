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
        // ============================================================
        // ADMIN - ALL ORDERS
        // ============================================================

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<OrderResponseDto>>> GetOrders()
        {
            return Ok(await service.GetAllOrders());
        }

        // ============================================================
        // CUSTOMER - MY NORMAL ORDERS
        // CustomPC orders are excluded in the service.
        // ============================================================

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

        // ============================================================
        // ADMIN - SINGLE ORDER
        // ============================================================

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponseDto>> GetOrderById(
            int id)
        {
            var order = await service.GetOrderById(id);

            if (order is null)
            {
                return NotFound("Order not found");
            }

            return Ok(order);
        }

        // ============================================================
        // NORMAL PRODUCT ORDER
        // ============================================================

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateOrder(
            CreateOrderDto order)
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

        // ============================================================
        // NORMAL PC BUILDER
        // PcBuild -> Order
        // ============================================================

        [Authorize]
        [HttpPost("pc-build")]
        public async Task<IActionResult> CreatePcBuildOrder(
            CreatePcBuildOrderDto dto)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid user authentication.");
            }

            try
            {
                var createdOrder = await service.CreatePcBuildOrder(
                    userId,
                    dto
                );

                return Ok(createdOrder);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // ============================================================
        // ADMIN - UPDATE ORDER STATUS
        // ============================================================

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

        // ============================================================
        // CUSTOMER - CANCEL ORDER
        // ============================================================

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult> CancelOrder(int id)
        {
            var cancelled = await service.CancelOrder(id);

            return cancelled
                ? NoContent()
                : NotFound("Order not found");
        }

        // ============================================================
        // ADMIN - PAGINATED ORDERS
        // ============================================================

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<PagedOrderResponseDto>> GetAdminOrders(
            int page = 1,
            int pageSize = 10)
        {
            var result = await service.GetAllOrdersPaged(
                page,
                pageSize
            );

            return Ok(result);
        }

        // ============================================================
        // AI AGENT BUILDER
        // PcBuildRequest -> Payment -> Order
        // ============================================================

        [Authorize]
        [HttpPost("pc-build-request")]
        public async Task<IActionResult> CreatePcBuildRequestOrder(
            CreatePcBuildRequestOrderDto dto)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid user authentication.");
            }

            try
            {
                var createdOrder =
                    await service.CreatePcBuildRequestOrder(
                        userId,
                        dto
                    );

                return Ok(createdOrder);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [Authorize]
        [HttpGet("my-pc-build-orders")]
        public async Task<ActionResult<PagedOrderResponseDto>>
    GetMyPcBuildOrders(
        int page = 1,
        int pageSize = 10)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Invalid user authentication.");
            }

            var result =
                await service.GetPcBuildOrdersByUserId(
                    userId,
                    page,
                    pageSize
                );

            return Ok(result);
        }
    }
}