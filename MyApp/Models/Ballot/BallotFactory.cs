using System.Collections.Generic;

namespace MyApp.Models.Ballot
{
    public class BallotFactory
    {
        public static IBallot CreateBallot(
            BallotType type,
            int id,
            string title,
            string description,
            List<Candidate> candidates)
        {
            return type switch
            {
                BallotType.YesNo => new YesNoBallot
                {
                    Id = id,
                    Title = title,
                    Description = description,
                    Candidates = candidates
                },
                BallotType.RankedChoice => new RankedChoiceBallot
                {
                    Id = id,
                    Title = title,
                    Description = description,
                    Candidates = candidates
                },
                BallotType.MultipleChoice => new MultipleChoiceBallot
                {
                    Id = id,
                    Title = title,
                    Description = description,
                    Candidates = candidates
                },
                _ => throw new System.ArgumentException($"Unsupported ballot type: {type}")
            };
        }
    }
} 