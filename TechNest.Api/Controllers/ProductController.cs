using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Services;
using TechNest.Api.DTOs;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController(IProductService service) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<ProductResponseDto>>> GetProducts()
        {
            return Ok(await service.GetAllProducts());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductResponseDto>> GetProductById(int id)
        {
            var product = await service.GetProductById(id);
            if (product is null)
            {
                return NotFound("Product not found");
            }
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> CreateProduct(CreateProductDto product)
        {
            var createdProduct = await service.CreateProduct(product);

            return CreatedAtAction(
                nameof(GetProductById),
                new { id = createdProduct.Id },
                createdProduct
            );
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateProduct(int id, UpdateProductDto product)
        {
            var updated = await service.UpdateProduct(id, product);
            return updated ? NoContent() : NotFound("Product not found");
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var deleted = await service.DeleteProduct(id);
            return deleted ? NoContent() : NotFound("Product not found");
        }
    }
}
