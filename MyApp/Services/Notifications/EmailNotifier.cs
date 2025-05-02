using MyApp.Models;
using Microsoft.Extensions.Logging;

namespace MyApp.Services.Notifications
{
    public class EmailNotifier : IElectionObserver
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailNotifier> _logger;

        public EmailNotifier(IEmailService emailService, ILogger<EmailNotifier> logger)
        {
            _emailService = emailService;
            _logger = logger;
        }

        public void OnElectionEvent(ElectionEvent electionEvent)
        {
            switch (electionEvent.EventType)
            {
                case "VotingStarted":
                    _emailService.SendVotingStartedEmailAsync("voter@example.com", "Voter");
                    break;
                case "VotingEnded":
                    _emailService.SendVotingEndedEmailAsync("voter@example.com", "Voter");
                    break;
                case "VoteSubmitted":
                    // Send vote confirmation email
                    _logger.LogInformation($"Vote confirmation email would be sent for event: {electionEvent.Message}");
                    break;
                default:
                    _logger.LogInformation($"Unhandled event type: {electionEvent.EventType}");
                    break;
            }
        }
    }
} 