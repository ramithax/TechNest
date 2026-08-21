using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechNest.Api.Dtos.UserDto;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService service) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<IActionResult> SignUp(RegisterDto register)
        {
            var user = await service.Register(register);

            if (user == null)
            {
                return BadRequest("Email already taken");
            }
            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<TokenResponseDto>> Login(LoginDto login)
        {
            var results = await service.Login(login);

            if (results == null)
            {
                return Unauthorized("Invalid credentials");
            }

            return Ok(results);
        }

        [HttpPost("refresh-token")]
        public async Task<ActionResult<TokenResponseDto>> RefreshToken(RefreshTokenRequestDto request)
        {
            var results = await service.RefreshToken(request);

            if (results == null)
            {
                return BadRequest("Invalid refresh token");
            }

            return Ok(results);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AdminOnly()
        {
            return Ok("You are an admin");
        }
    }
}