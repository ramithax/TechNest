using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using TechNest.Api.Data;
using TechNest.Api.Dtos.UserDto;
using TechNest.Api.Models;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services
{
    public class AuthService(
        AppDbContext context,
        IConfiguration configuration
    ) : IAuthService
    {
        // LOGIN
        public async Task<TokenResponseDto?> Login(LoginDto login)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == login.Email);

            if (user is null || user.Isblocked)
            {
                return null;
            }

            var passwordResult = new PasswordHasher<User>()
                .VerifyHashedPassword(
                    user,
                    user.PasswordHash,
                    login.Password
                );

            if (passwordResult == PasswordVerificationResult.Failed)
            {
                return null;
            }

            var response = new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshToken(user)
            };

            return response;
        }


        // REGISTER
        public async Task<UserResponseDto?> Register(RegisterDto register)
        {
            if (await context.Users.AnyAsync(u => u.Email == register.Email))
            {
                return null;
            }

            var user = new User
            {
                Name = register.Name,
                Email = register.Email,
                PasswordHash = new PasswordHasher<User>()
                    .HashPassword(
                        null!,
                        register.Password
                    )
            };

            context.Users.Add(user);

            await context.SaveChangesAsync();

            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                IsBlocked = user.Isblocked
            };
        }


        // REFRESH TOKEN
        public async Task<TokenResponseDto?> RefreshToken(
            RefreshTokenRequestDto request)
        {
            var user = await ValidateRefreshToken(
                request.UserId,
                request.RefreshToken
            );

            if (user is null)
            {
                return null;
            }

            var response = new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshToken(user)
            };

            return response;
        }


        // VALIDATE REFRESH TOKEN
        private async Task<User?> ValidateRefreshToken(
            int userId,
            string refreshToken)
        {
            var user = await context.Users
                .FindAsync(userId);

            if (user is null)
            {
                return null;
            }

            if (user.Isblocked)
            {
                return null;
            }

            if (user.RefreshToken != refreshToken)
            {
                return null;
            }

            if (user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return null;
            }

            return user;
        }


        // GENERATE REFRESH TOKEN
        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];

            using var rng = RandomNumberGenerator.Create();

            rng.GetBytes(randomNumber);

            return Convert.ToBase64String(randomNumber);
        }


        // SAVE REFRESH TOKEN
        private async Task<string> GenerateAndSaveRefreshToken(
            User user)
        {
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;

            user.RefreshTokenExpiryTime =
                DateTime.UtcNow.AddDays(7);

            await context.SaveChangesAsync();

            return refreshToken;
        }


        // CREATE JWT ACCESS TOKEN
        private string CreateToken(User user)
        {
            var claims = new List<Claim>
    {
        new Claim(
            ClaimTypes.Name,
            user.Name
        ),

        new Claim(
            ClaimTypes.NameIdentifier,
            user.Id.ToString()
        ),

        new Claim(
            ClaimTypes.Email,
            user.Email
        ),

        new Claim(
            ClaimTypes.Role,
            user.Role.Trim()
        )
    };

            var tokenKey = configuration.GetValue<string>(
                "AppSettings:Token"
            );

            if (string.IsNullOrEmpty(tokenKey))
            {
                throw new InvalidOperationException(
                    "JWT token key is not configured."
                );
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(tokenKey)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha512
            );

            var tokenDescriptor = new JwtSecurityToken(
                issuer: configuration.GetValue<string>(
                    "AppSettings:Issuer"
                ),

                audience: configuration.GetValue<string>(
                    "AppSettings:Audience"
                ),

                claims: claims,

                expires: DateTime.UtcNow.AddDays(1),

                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler()
                .WriteToken(tokenDescriptor);
        }
    }
}