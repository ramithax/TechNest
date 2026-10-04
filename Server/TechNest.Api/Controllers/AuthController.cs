using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
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
        [HttpGet("users")]
        public async Task<ActionResult> GetAllUsers()
        {
            var users = await service.GetUsers();
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("users/{id}")]
        public async Task<ActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            var user = await service.UpdateUser(id, dto);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found"
                });
            }

            return Ok(user);
        }

        [HttpPost("google")]
        public async Task<ActionResult<TokenResponseDto>> GoogleLogin(GoogleLoginDto request)
        {
            var results = await service.GoogleLogin(request);

            if (results == null)
            {
                return Unauthorized("Google authentication failed");
            }

            return Ok(results);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(
    ForgotPasswordDto request)
        {
            await service.ForgotPassword(request.Email);

            return Ok(new
            {
                message =
                    "If an account exists with this email, a password reset link has been sent."
            });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(
    ResetPasswordDto request)
        {
            var result = await service.ResetPassword(
                request.Token,
                request.NewPassword
            );

            if (!result)
            {
                return BadRequest(
                    "Invalid or expired reset token."
                );
            }

            return Ok(new
            {
                message = "Password reset successfully."
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin-only")]
        public IActionResult AdminOnly()
        {
            return Ok("You are an admin");
        }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<TokenResponseDto>> UpdateProfile(
        UpdateProfileDto dto)
            {
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized();
                }

                if (!int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized();
                }

                var result = await service.UpdateProfile(userId, dto);

                if (result == null)
                {
                    return BadRequest("Email already taken");
                }

                return Ok(result);
            }

    }
}