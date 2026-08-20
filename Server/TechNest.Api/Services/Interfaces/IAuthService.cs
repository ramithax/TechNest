using TechNest.Api.Dtos.UserDto;
using TechNest.Api.Models;

namespace TechNest.Api.Services.Interfaces
{
    public interface IAuthService
    {

        Task<UserResponseDto?> Register(RegisterDto register);
        Task<TokenResponseDto?> Login(LoginDto login);
        Task<TokenResponseDto?> RefreshToken(RefreshTokenRequestDto request);
    }
}
