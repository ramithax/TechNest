using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Models;
using TechNest.Api.Services;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController(IProductServices service) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetProducts()
        {
            return Ok(await service.GetAllProducts());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProductById(int id)
        {
            var product = await service.GetProductById(id);
            if (product is null)
            {
                return NotFound("Product not found");
            }
            return Ok(product);
        }

    }
}
