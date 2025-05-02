using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;
using Microsoft.Extensions.Logging;

namespace MyApp.Services.Notifications
{
    public class ElectionSubject
    {
        private readonly List<IElectionObserver> _observers;
        private readonly ILogger<ElectionSubject> _logger;

        public ElectionSubject(ILogger<ElectionSubject> logger)
        {
            _observers = new List<IElectionObserver>();
            _logger = logger;
        }

        public void Attach(IElectionObserver observer)
        {
            if (!_observers.Contains(observer))
            {
                _observers.Add(observer);
                _logger.LogInformation($"Observer {observer.GetType().Name} attached");
            }
        }

        public void Detach(IElectionObserver observer)
        {
            if (_observers.Contains(observer))
            {
                _observers.Remove(observer);
                _logger.LogInformation($"Observer {observer.GetType().Name} detached");
            }
        }

        public async Task NotifyObserversAsync(ElectionEvent electionEvent)
        {
            _logger.LogInformation($"Notifying observers about event: {electionEvent.EventType}");

            foreach (var observer in _observers)
            {
                try
                {
                    observer.OnElectionEvent(electionEvent);
                    _logger.LogInformation($"Successfully notified observer {observer.GetType().Name}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error notifying observer {observer.GetType().Name}");
                }
            }
        }
    }
} 