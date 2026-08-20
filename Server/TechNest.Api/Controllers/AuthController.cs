using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Dtos.UserDto;
using TechNest.Api.Models;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        static User user = new();

        [HttpPost("register")]
        public IActionResult SignUp(RegisterDto register)
        {
            var hashedPassword = new PasswordHasher<User>()
                .HashPassword(user, register.Password);

            user.Name = register.Name;
            user.PasswordHash = hashedPassword;

            return Ok(user);
        }

        [HttpPost("login")]
        public ActionResult<string> Login(LoginDto login)
        {
            if(user.Name != login.Name)
            {
                return BadRequest("User not found.");
            }

            if()
        }
    }
}