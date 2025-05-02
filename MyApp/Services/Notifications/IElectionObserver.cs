using MyApp.Models;

namespace MyApp.Services.Notifications
{
    public interface IElectionObserver
    {
        void OnElectionEvent(ElectionEvent electionEvent);
    }
} 