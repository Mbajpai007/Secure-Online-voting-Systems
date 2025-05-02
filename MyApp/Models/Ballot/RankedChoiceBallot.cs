using System.Collections.Generic;
using System.Linq;

namespace MyApp.Models.Ballot
{
    public class RankedChoiceBallot : IBallot
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public List<Candidate> Candidates { get; set; }
        public BallotType Type => BallotType.RankedChoice;

        public bool ValidateVote(object vote)
        {
            if (vote is List<RankedVote> rankedVotes)
            {
                // Check if all candidates are ranked exactly once
                var candidateIds = Candidates.Select(c => c.Id).ToHashSet();
                var rankedCandidateIds = rankedVotes.Select(v => v.CandidateId).ToHashSet();

                if (!candidateIds.SetEquals(rankedCandidateIds))
                    return false;

                // Check if ranks are valid (1 to n)
                var ranks = rankedVotes.Select(v => v.Rank).ToHashSet();
                return ranks.Count == Candidates.Count &&
                       ranks.Min() == 1 &&
                       ranks.Max() == Candidates.Count;
            }
            return false;
        }
    }

    public class RankedVote
    {
        public int CandidateId { get; set; }
        public int Rank { get; set; }
    }
} 