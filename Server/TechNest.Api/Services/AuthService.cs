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
using Google.Apis.Auth;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services
{
    public class AuthService(
    AppDbContext context,
    IConfiguration configuration,
    IEmailService emailService
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

        public async Task<IEnumerable<UserResponseDto>> GetUsers()
        {
            return await context.Users
                .Select(user => new UserResponseDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                    CreatedAt = user.CreatedAt,
                    IsBlocked = user.Isblocked
                })
                .ToListAsync();
        }

        public async Task<UserResponseDto?> UpdateUser(int id, UpdateUserDto dto)
        {
            var user = await context.Users.FindAsync(id);

            if (user == null)
            {
                return null;
            }

            user.Role = dto.Role;
            user.Isblocked = dto.IsBlocked;

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

        public async Task<TokenResponseDto?> GoogleLogin(
    GoogleLoginDto request)
        {
            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(
                    request.IdToken
                );
            }
            catch
            {
                return null;
            }

            if (string.IsNullOrEmpty(payload.Email))
            {
                return null;
            }

            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == payload.Email);

            if (user is null)
            {
                user = new User
                {
                    Name = payload.Name ?? "Google User",
                    Email = payload.Email,
                    PasswordHash = string.Empty
                };

                context.Users.Add(user);

                await context.SaveChangesAsync();
            }

            if (user.Isblocked)
            {
                return null;
            }

            return new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshToken(user)
            };
        }

        // FORGOT PASSWORD
        // FORGOT PASSWORD
        public async Task ForgotPassword(string email)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user is null)
            {
                return;
            }

            var tokenBytes =
                RandomNumberGenerator.GetBytes(32);

            var token =
                Convert.ToBase64String(tokenBytes);

            user.PasswordResetToken = token;

            user.PasswordResetTokenExpiry =
                DateTime.UtcNow.AddMinutes(30);

            await context.SaveChangesAsync();

            var resetLink =
                $"http://localhost:61742/#/reset-password?token={Uri.EscapeDataString(token)}";

            await emailService.SendPasswordResetEmail(
                user.Email,
                resetLink
            );
        }

        // RESET PASSWORD
        public async Task<bool> ResetPassword(
            string token,
            string newPassword)
        {
            var user = await context.Users
                .FirstOrDefaultAsync(u =>
                    u.PasswordResetToken == token &&
                    u.PasswordResetTokenExpiry > DateTime.UtcNow
                );

            if (user is null)
            {
                return false;
            }

            user.PasswordHash =
                new PasswordHasher<User>()
                    .HashPassword(
                        user,
                        newPassword
                    );

            user.PasswordResetToken = null;

            user.PasswordResetTokenExpiry = null;

            await context.SaveChangesAsync();

            return true;
        }

public async Task<TokenResponseDto?> UpdateProfile(
    int userId,
    UpdateProfileDto dto)
        {
            var user = await context.Users.FindAsync(userId);

            if (user == null)
            {
                return null;
            }

            var emailExists = await context.Users
                .AnyAsync(u =>
                    u.Email == dto.Email &&
                    u.Id != userId);

            if (emailExists)
            {
                return null;
            }

            user.Name = dto.Name.Trim();
            user.Email = dto.Email.Trim();

            await context.SaveChangesAsync();

            return new TokenResponseDto
            {
                AccessToken = CreateToken(user),
                RefreshToken = await GenerateAndSaveRefreshToken(user)
            };
        }


    }
}