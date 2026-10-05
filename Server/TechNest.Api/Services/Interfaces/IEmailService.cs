namespace TechNest.Api.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendPasswordResetEmail(
            string email,
            string resetLink);
    }
}