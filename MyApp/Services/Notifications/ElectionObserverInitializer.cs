using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace MyApp.Services.Notifications
{
    public class ElectionObserverInitializer
    {
        private readonly ElectionSubject _electionSubject;
        private readonly IEnumerable<IElectionObserver> _observers;
        private readonly ILogger<ElectionObserverInitializer> _logger;

        public ElectionObserverInitializer(
            ElectionSubject electionSubject,
            IEnumerable<IElectionObserver> observers,
            ILogger<ElectionObserverInitializer> logger)
        {
            _electionSubject = electionSubject;
            _observers = observers;
            _logger = logger;
        }

        public void Initialize()
        {
            try
            {
                foreach (var observer in _observers)
                {
                    _electionSubject.Attach(observer);
                    _logger.LogInformation($"Attached observer: {observer.GetType().Name}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing election observers");
            }
        }
    }
} 