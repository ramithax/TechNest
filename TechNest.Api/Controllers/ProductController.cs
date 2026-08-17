using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Models;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        static List<Product> products = new List<Product>
{
    new Product
    {
        Id = 1,
        Name = "Laptop",
        ActualPrice = 150000
    },
    new Product
    {
        Id = 2,
        Name = "Keyboard",
        ActualPrice = 5000
    }
};

        [HttpGet]
        public async Task<ActionResult<List<Product>>> GetProducts()
        {
            return Ok(products);
        }
    }
}
