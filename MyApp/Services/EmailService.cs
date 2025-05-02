using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Mail;
using System.Net;

namespace MyApp.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly bool _enableSsl;

        public EmailService(
            IConfiguration configuration,
            ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _smtpServer = _configuration["Email:SmtpServer"];
            _smtpPort = int.Parse(_configuration["Email:SmtpPort"]);
            _smtpUsername = _configuration["Email:Username"];
            _smtpPassword = _configuration["Email:Password"];
            _fromEmail = _configuration["Email:FromEmail"];
            _fromName = _configuration["Email:FromName"];
            _enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");
        }

        public async Task SendVotingStartedEmailAsync(string toEmail, string voterName)
        {
            try
            {
                using var client = new SmtpClient(_smtpServer, _smtpPort)
                {
                    Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                    EnableSsl = _enableSsl,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Timeout = 30000 // 30 seconds timeout
                };

                var message = new MailMessage
                {
                    From = new MailAddress(_fromEmail, _fromName),
                    Subject = "Voting Has Started!",
                    Body = GenerateVotingStartedEmailBody(voterName),
                    IsBodyHtml = true,
                    Priority = MailPriority.Normal
                };

                // Add headers for SendGrid
                message.Headers.Add("X-SMTPAPI", "{\"category\": \"voting_started\"}");
                
                message.To.Add(new MailAddress(toEmail));

                _logger.LogInformation($"Attempting to send email to {toEmail}");
                await client.SendMailAsync(message);
                _logger.LogInformation($"Voting started email sent to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending voting started email to {toEmail}. Error details: {ex.Message}");
                throw;
            }
        }

        public async Task SendVotingEndedEmailAsync(string toEmail, string voterName)
        {
            try
            {
                using var client = new SmtpClient(_smtpServer, _smtpPort)
                {
                    Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                    EnableSsl = _enableSsl,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Timeout = 30000 // 30 seconds timeout
                };

                var message = new MailMessage
                {
                    From = new MailAddress(_fromEmail, _fromName),
                    Subject = "Voting Has Ended",
                    Body = GenerateVotingEndedEmailBody(voterName),
                    IsBodyHtml = true,
                    Priority = MailPriority.Normal
                };

                // Add headers for SendGrid
                message.Headers.Add("X-SMTPAPI", "{\"category\": \"voting_ended\"}");
                
                message.To.Add(new MailAddress(toEmail));

                _logger.LogInformation($"Attempting to send email to {toEmail}");
                await client.SendMailAsync(message);
                _logger.LogInformation($"Voting ended email sent to {toEmail}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending voting ended email to {toEmail}. Error details: {ex.Message}");
                throw;
            }
        }

        private string GenerateVotingStartedEmailBody(string voterName)
        {
            return $@"
                <html>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                            <h2 style='color: #2c3e50;'>Voting Has Started!</h2>
                            <p>Dear {voterName},</p>
                            <p>The voting period has now begun. You can cast your vote by logging into your account.</p>
                            <p>Please make sure to cast your vote before the voting period ends.</p>
                            <p>Best regards,<br>Election Committee</p>
                        </div>
                    </body>
                </html>";
        }

        private string GenerateVotingEndedEmailBody(string voterName)
        {
            return $@"
                <html>
                    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                        <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                            <h2 style='color: #2c3e50;'>Voting Has Ended</h2>
                            <p>Dear {voterName},</p>
                            <p>The voting period has now ended. Thank you for participating in the election.</p>
                            <p>The results will be announced soon.</p>
                            <p>Best regards,<br>Election Committee</p>
                        </div>
                    </body>
                </html>";
        }
    }
} 