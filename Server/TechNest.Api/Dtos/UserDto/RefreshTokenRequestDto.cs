namespace TechNest.Api.Dtos.UserDto
{
    public class RefreshTokenRequestDto
    {

        public int UserId { get; set; }
        public required string RefreshToken { get; set; }
    }
}
