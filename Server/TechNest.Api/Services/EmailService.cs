using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services
{
    public class EmailService(
        IConfiguration configuration,
        HttpClient httpClient,
        ILogger<EmailService> logger
    ) : IEmailService
    {
        public async Task SendPasswordResetEmail(
            string email,
            string resetLink)
        {
            var apiKey = configuration["EmailSettings:ApiKey"];
            var fromEmail = configuration["EmailSettings:FromEmail"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException(
                    "EmailSettings:ApiKey is missing."
                );
            }

            if (string.IsNullOrWhiteSpace(fromEmail))
            {
                throw new InvalidOperationException(
                    "EmailSettings:FromEmail is missing."
                );
            }

            var safeResetLink = WebUtility.HtmlEncode(resetLink);

            var html = $"""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#f5f5f4;
                    font-family:Arial,Helvetica,sans-serif;
                ">
                    <div style="
                        max-width:600px;
                        margin:40px auto;
                        background:#ffffff;
                        border-radius:12px;
                        overflow:hidden;
                    ">
                        <div style="
                            background:#18181b;
                            padding:30px;
                            text-align:center;
                        ">
                            <h1 style="margin:0;color:#ffffff;">
                                TechNest
                            </h1>
                        </div>

                        <div style="padding:40px 30px;">
                            <h2 style="color:#18181b;">
                                Reset Your Password
                            </h2>

                            <p style="
                                color:#52525b;
                                font-size:15px;
                                line-height:1.6;
                            ">
                                We received a request to reset your
                                TechNest account password.
                            </p>

                            <p style="
                                color:#52525b;
                                font-size:15px;
                                line-height:1.6;
                            ">
                                Click the button below to create a new password.
                            </p>

                            <div style="text-align:center;margin:35px 0;">
                                <a href="{safeResetLink}"
                                   style="
                                       display:inline-block;
                                       background:#c29a55;
                                       color:#ffffff;
                                       text-decoration:none;
                                       padding:14px 28px;
                                       border-radius:8px;
                                       font-size:15px;
                                       font-weight:bold;
                                   ">
                                    Reset Password
                                </a>
                            </div>

                            <p style="
                                color:#71717a;
                                font-size:13px;
                                line-height:1.6;
                            ">
                                If the button does not work, open this link:
                                <br>
                                <a href="{safeResetLink}"
                                   style="color:#765b2d;word-break:break-all;">
                                    {safeResetLink}
                                </a>
                            </p>

                            <p style="
                                color:#71717a;
                                font-size:13px;
                                line-height:1.6;
                            ">
                                If you did not request a password reset,
                                you can safely ignore this email.
                            </p>
                        </div>

                        <div style="
                            background:#fafafa;
                            padding:20px;
                            text-align:center;
                        ">
                            <p style="
                                margin:0;
                                color:#a1a1aa;
                                font-size:12px;
                            ">
                                © TechNest. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """;

            using var request = new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.resend.com/emails"
            );

            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", apiKey);

            request.Content = JsonContent.Create(new
            {
                from = fromEmail,
                to = new[] { email },
                subject = "Reset Your TechNest Password",
                html,
                text =
                    $"Reset your TechNest password: {resetLink}\n\n" +
                    "If you did not request this, ignore this email."
            });

            using var response = await httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                // Avoid logging the reset link or API key.
                logger.LogError(
                    "Email provider rejected password reset email. " +
                    "HTTP status: {StatusCode}. Check Resend dashboard logs.",
                    (int)response.StatusCode
                );

                throw new HttpRequestException(
                    "Failed to send password reset email.",
                    null,
                    response.StatusCode
                );
            }

            logger.LogInformation(
                "Password reset email accepted by email provider."
            );
        }
    }
}