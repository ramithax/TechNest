using Resend;
using TechNest.Api.Services.Interfaces;

namespace TechNest.Api.Services
{
    public class EmailService(IResend resend)
        : IEmailService
    {
        public async Task SendPasswordResetEmail(
            string email,
            string resetLink)
        {
            var message = new EmailMessage
            {
                From = "onboarding@resend.dev",
                Subject = "Reset Your TechNest Password",
                HtmlBody = $"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>

                    <body style="
                        margin: 0;
                        padding: 0;
                        background-color: #f5f5f4;
                        font-family: Arial, Helvetica, sans-serif;
                    ">

                        <div style="
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
                        ">

                            <div style="
                                background-color: #18181b;
                                padding: 30px;
                                text-align: center;
                            ">
                                <h1 style="
                                    margin: 0;
                                    color: #ffffff;
                                    font-size: 28px;
                                ">
                                    TechNest
                                </h1>
                            </div>

                            <div style="padding: 40px 30px;">

                                <h2 style="
                                    margin-top: 0;
                                    color: #18181b;
                                ">
                                    Reset Your Password
                                </h2>

                                <p style="
                                    color: #52525b;
                                    font-size: 15px;
                                    line-height: 1.6;
                                ">
                                    We received a request to reset your
                                    TechNest account password.
                                </p>

                                <p style="
                                    color: #52525b;
                                    font-size: 15px;
                                    line-height: 1.6;
                                ">
                                    Click the button below to create a new password.
                                </p>

                                <div style="
                                    text-align: center;
                                    margin: 35px 0;
                                ">
                                    <a href="{resetLink}"
                                       style="
                                           display: inline-block;
                                           background-color: #c29a55;
                                           color: #ffffff;
                                           text-decoration: none;
                                           padding: 14px 28px;
                                           border-radius: 8px;
                                           font-size: 15px;
                                           font-weight: bold;
                                       ">
                                        Reset Password
                                    </a>
                                </div>

                                <p style="
                                    color: #71717a;
                                    font-size: 13px;
                                    line-height: 1.6;
                                ">
                                    This password reset link will expire after
                                    the configured period.
                                </p>

                                <p style="
                                    color: #71717a;
                                    font-size: 13px;
                                    line-height: 1.6;
                                ">
                                    If you did not request a password reset,
                                    you can safely ignore this email.
                                </p>

                            </div>

                            <div style="
                                background-color: #fafafa;
                                padding: 20px 30px;
                                text-align: center;
                                border-top: 1px solid #e4e4e7;
                            ">
                                <p style="
                                    margin: 0;
                                    color: #a1a1aa;
                                    font-size: 12px;
                                ">
                                    © TechNest. All rights reserved.
                                </p>
                            </div>

                        </div>

                    </body>
                    </html>
                    """
            };

            message.To.Add(email);

            await resend.EmailSendAsync(message);
        }
    }
}