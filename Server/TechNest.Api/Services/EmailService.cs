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
                )
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
                        margin: 0;
                        padding: 0;
                        background-color: #eef2f7;
                        font-family: Arial, Helvetica, sans-serif;
                    ">

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            style="background-color: #eef2f7; padding: 40px 20px;"
                        >
                            <tr>
                                <td align="center">

                                    <table
                                        width="600"
                                        cellpadding="0"
                                        cellspacing="0"
                                        style="
                                            max-width: 600px;
                                            width: 100%;
                                            background-color: #ffffff;
                                            border-radius: 14px;
                                            overflow: hidden;
                                            box-shadow: 0 4px 20px rgba(11,31,58,0.10);
                                        "
                                    >

                                        <!-- Header -->
                                        <tr>
                                            <td
                                                style="
                                                    background-color: #0b1f3a;
                                                    padding: 28px 35px;
                                                    text-align: center;
                                                "
                                            >
                                                <div style="
                                                    color: #ffffff;
                                                    font-size: 28px;
                                                    font-weight: 700;
                                                    letter-spacing: 0.5px;
                                                ">
                                                    TechNest
                                                </div>

                                                <div style="
                                                    color: #dbe7f3;
                                                    font-size: 13px;
                                                    margin-top: 6px;
                                                ">
                                                    Technology made simple.
                                                </div>
                                            </td>
                                        </tr>

                                        <!-- Content -->
                                        <tr>
                                            <td style="padding: 40px 45px;">

                                                <h1 style="
                                                    margin: 0 0 18px 0;
                                                    color: #172033;
                                                    font-size: 25px;
                                                    font-weight: 600;
                                                ">
                                                    Reset your password
                                                </h1>

                                                <p style="
                                                    margin: 0 0 18px 0;
                                                    color: #4b5563;
                                                    font-size: 15px;
                                                    line-height: 1.7;
                                                ">
                                                    Hello,
                                                </p>

                                                <p style="
                                                    margin: 0 0 25px 0;
                                                    color: #4b5563;
                                                    font-size: 15px;
                                                    line-height: 1.7;
                                                ">
                                                    We received a request to reset the password
                                                    for your TechNest account.
                                                </p>

                                                <p style="
                                                    margin: 0 0 28px 0;
                                                    color: #4b5563;
                                                    font-size: 15px;
                                                    line-height: 1.7;
                                                ">
                                                    Click the button below to create a new password.
                                                </p>

                                                <!-- Button -->
                                                <table
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    style="margin: 0 auto 30px auto;"
                                                >
                                                    <tr>
                                                        <td
                                                            align="center"
                                                            style="
                                                                border-radius: 8px;
                                                                background-color: #123a63;
                                                            "
                                                        >
                                                            <a
                                                                href="{resetLink}"
                                                                style="
                                                                    display: inline-block;
                                                                    padding: 14px 30px;
                                                                    color: #ffffff;
                                                                    text-decoration: none;
                                                                    font-size: 15px;
                                                                    font-weight: 600;
                                                                    border-radius: 8px;
                                                                "
                                                            >
                                                                Reset Password
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Expiry notice -->
                                                <table
                                                    width="100%"
                                                    cellpadding="0"
                                                    cellspacing="0"
                                                    style="
                                                        background-color: #f4f7fa;
                                                        border-left: 4px solid #123a63;
                                                        margin-bottom: 28px;
                                                    "
                                                >
                                                    <tr>
                                                        <td style="padding: 14px 16px;">
                                                            <p style="
                                                                margin: 0;
                                                                color: #4b5563;
                                                                font-size: 13px;
                                                                line-height: 1.6;
                                                            ">
                                                                This password reset link will expire
                                                                in <strong>30 minutes</strong>.
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <p style="
                                                    margin: 0 0 12px 0;
                                                    color: #6b7280;
                                                    font-size: 13px;
                                                    line-height: 1.6;
                                                ">
                                                    If the button above doesn't work, copy and paste
                                                    the following link into your browser:
                                                </p>

                                                <p style="
                                                    margin: 0 0 28px 0;
                                                    word-break: break-all;
                                                    font-size: 12px;
                                                    line-height: 1.6;
                                                ">
                                                    <a
                                                        href="{resetLink}"
                                                        style="
                                                            color: #245a8d;
                                                            text-decoration: none;
                                                        "
                                                    >
                                                        {resetLink}
                                                    </a>
                                                </p>

                                                <p style="
                                                    margin: 0 0 8px 0;
                                                    color: #6b7280;
                                                    font-size: 13px;
                                                    line-height: 1.6;
                                                ">
                                                    If you didn't request a password reset,
                                                    you can safely ignore this email.
                                                </p>

                                                <p style="
                                                    margin: 25px 0 0 0;
                                                    color: #4b5563;
                                                    font-size: 14px;
                                                    line-height: 1.6;
                                                ">
                                                    Regards,<br>
                                                    <strong>TechNest Team</strong>
                                                </p>

                                            </td>
                                        </tr>

                                        <!-- Footer -->
                                        <tr>
                                            <td style="
                                                background-color: #f4f7fa;
                                                padding: 22px 35px;
                                                text-align: center;
                                                border-top: 1px solid #dbe2ea;
                                            ">
                                                <p style="
                                                    margin: 0;
                                                    color: #8a94a3;
                                                    font-size: 12px;
                                                ">
                                                    © TechNest. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>

                                    </table>

                                </td>
                            </tr>
                        </table>

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
