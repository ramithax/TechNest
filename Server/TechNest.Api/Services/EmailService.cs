using System.Net;
using System.Net.Mail;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services
{
    public class EmailService(IConfiguration configuration)
        : IEmailService
    {
        public async Task SendPasswordResetEmail(
            string email,
            string resetLink)
        {
            var smtpEmail = configuration["EmailSettings:Email"];
            var smtpPassword = configuration["EmailSettings:AppPassword"];

            using var client = new SmtpClient("smtp.gmail.com", 587)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(
                    smtpEmail,
                    smtpPassword
                ),
                Timeout = 30000
            };

            using var message = new MailMessage
            {
                From = new MailAddress(
                    smtpEmail!,
                    "TechNest"
                ),
                Subject = "Reset Your TechNest Password",
                Body = $"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                            <h1 style="
                                margin:0;
                                color:#ffffff;
                            ">
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

                            <div style="
                                text-align:center;
                                margin:35px 0;
                            ">
                                <a href="{resetLink}"
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
                    """,
                IsBodyHtml = true
            };

            message.To.Add(email);

            await client.SendMailAsync(message);
        }
    }
}