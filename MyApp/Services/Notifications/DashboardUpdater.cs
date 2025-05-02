using MyApp.Models;
using Microsoft.Extensions.Logging;

namespace MyApp.Services.Notifications
{
    public class DashboardUpdater : IElectionObserver
    {
        private readonly ILogger<DashboardUpdater> _logger;

        public DashboardUpdater(ILogger<DashboardUpdater> logger)
        {
            _logger = logger;
        }

        public void OnElectionEvent(ElectionEvent electionEvent)
        {
            switch (electionEvent.EventType)
            {
                case "TurnoutMilestone":
                    var percentage = ((dynamic)electionEvent.Data).Percentage;
                    _logger.LogInformation($"Dashboard updated with new turnout milestone: {percentage}%");
                    // Here you would update the dashboard UI through SignalR or similar
                    break;
                case "VoteSubmitted":
                    _logger.LogInformation($"Dashboard updated with new vote submission");
                    // Update vote count and statistics
                    break;
                case "VotingStarted":
                case "VotingEnded":
                    _logger.LogInformation($"Dashboard updated with voting status change: {electionEvent.EventType}");
                    // Update voting status display
                    break;
                default:
                    _logger.LogInformation($"Unhandled event type: {electionEvent.EventType}");
                    break;
            }
        }
    }
} 