using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Dtos.OrderDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController(IOrderService service) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<OrderResponseDto>>> GetOrders()
        {
            return Ok(await service.GetAllOrders());
        }

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

        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateOrderStatus(int id, [FromQuery] string newStatus, [FromQuery] string? trackingNumber = null, [FromQuery] string? adminNotes = null)
        {
            var updated = await service.UpdateOrderStatus(id, newStatus, trackingNumber, adminNotes);
            return updated ? NoContent() : NotFound("Order not found");
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> CancelOrder(int id)
        {
            var cancelled = await service.CancelOrder(id);
            return cancelled ? NoContent() : NotFound("Order not found");
        }
    }
}
