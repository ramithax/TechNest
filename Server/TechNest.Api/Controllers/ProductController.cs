using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Dtos;
using TechNest.Api.Dtos.ProductDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductController(IProductService service) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<PagedProductResponseDto>> GetProducts(
        int page = 1,
        int pageSize = 10,
        string? search = null,
        string? category = null)
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1 || pageSize > 50)
        {
            pageSize = 10;
        }

        bool isAdmin = User.IsInRole("Admin");

        return Ok(
            await service.GetAllProducts(
                page,
                pageSize,
                includeInactive: isAdmin,
                search: search,
                category: category
            )
        );
    }

    [AllowAnonymous]
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
    public async Task<IActionResult> CreateProduct(
        CreateProductDto product)
    {
        var createdProduct =
            await service.CreateProduct(product);

        return CreatedAtAction(
            nameof(GetProductById),
            new { id = createdProduct.Id },
            createdProduct
        );
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateProduct(
        int id,
        UpdateProductDto product)
    {
        var updated =
            await service.UpdateProduct(id, product);

        return updated
            ? NoContent()
            : NotFound("Product not found");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var deleted =
            await service.DeleteProduct(id);

        return deleted
            ? NoContent()
            : NotFound("Product not found");
    }
}