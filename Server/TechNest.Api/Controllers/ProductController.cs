using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Dtos.ProductDto;
using TechNest.Api.DTOs;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers;

    [Authorize(Roles = "Admin")]
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

        [Authorize(Roles = "Admin")]
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

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateProduct(int id, UpdateProductDto product)
        {
            var updated = await service.UpdateProduct(id, product);
            return updated ? NoContent() : NotFound("Product not found");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeeleteProduct(int id)
        {
            var deleted = await service.DeleteProduct(id);
            return deleted ? NoContent() : NotFound("Product not found");
        }
    }
}
