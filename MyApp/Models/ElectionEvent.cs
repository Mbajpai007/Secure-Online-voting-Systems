using System;

namespace MyApp.Models
{
    public class ElectionEvent
    {
        public string EventType { get; set; }
        public string Message { get; set; }
        public DateTime Timestamp { get; set; }
        public object Data { get; set; }

        public static ElectionEvent CreateVoteSubmitted(int userId, int ballotId)
        {
            return new ElectionEvent
            {
                EventType = "VoteSubmitted",
                Message = $"Vote submitted for ballot {ballotId}",
                Timestamp = DateTime.UtcNow,
                Data = new { UserId = userId, BallotId = ballotId }
            };
        }

        public static ElectionEvent CreateTurnoutMilestone(int percentage)
        {
            return new ElectionEvent
            {
                EventType = "TurnoutMilestone",
                Message = $"Voter turnout reached {percentage}%",
                Timestamp = DateTime.UtcNow,
                Data = new { Percentage = percentage }
            };
        }

        public static ElectionEvent CreateVotingStarted()
        {
            return new ElectionEvent
            {
                EventType = "VotingStarted",
                Message = "Voting period has started",
                Timestamp = DateTime.UtcNow
            };
        }

        public static ElectionEvent CreateVotingEnded()
        {
            return new ElectionEvent
            {
                EventType = "VotingEnded",
                Message = "Voting period has ended",
                Timestamp = DateTime.UtcNow
            };
        }
    }
} 