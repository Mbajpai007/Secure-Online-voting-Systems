using System.Collections.Generic;
using System.Linq;

namespace MyApp.Models.Ballot
{
    public class MultipleChoiceBallot : IBallot
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public List<Candidate> Candidates { get; set; }
        public BallotType Type => BallotType.MultipleChoice;

        public bool ValidateVote(object vote)
        {
            if (vote is List<int> selectedCandidateIds)
            {
                // Check if all selected candidates exist
                var validCandidateIds = Candidates.Select(c => c.Id).ToHashSet();
                return selectedCandidateIds.All(id => validCandidateIds.Contains(id));
            }
            return false;
        }
    }
} 