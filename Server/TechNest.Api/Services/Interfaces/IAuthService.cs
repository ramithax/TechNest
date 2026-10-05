using TechNest.Api.Dtos.UserDto;

namespace TechNest.Api.Services.Interfaces
{
    public interface IAuthService
    {
        Task<UserResponseDto?> Register(RegisterDto register);

        Task<TokenResponseDto?> Login(LoginDto login);

        Task<TokenResponseDto?> GoogleLogin(
            GoogleLoginDto request);

        Task<TokenResponseDto?> RefreshToken(
            RefreshTokenRequestDto request);

        Task<IEnumerable<UserResponseDto>> GetUsers();

        Task<UserResponseDto?> UpdateUser(
            int id,
            UpdateUserDto dto);

        Task ForgotPassword(string email);

        Task<bool> ResetPassword(
            string token,
            string newPassword);

        Task<TokenResponseDto?> UpdateProfile(int userId, UpdateProfileDto dto);
    }
}