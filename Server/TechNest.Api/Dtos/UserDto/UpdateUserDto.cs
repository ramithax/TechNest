namespace TechNest.Api.Dtos.UserDto
{
    public class UpdateUserDto
    {
        public string Role { get; set; } = string.Empty;

        public bool IsBlocked { get; set; }
    }
}