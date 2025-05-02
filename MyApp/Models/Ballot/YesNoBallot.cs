using System.Collections.Generic;

namespace MyApp.Models.Ballot
{
    public class YesNoBallot : IBallot
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public List<Candidate> Candidates { get; set; }
        public BallotType Type => BallotType.YesNo;

        public bool ValidateVote(object vote)
        {
            if (vote is string voteStr)
            {
                return voteStr.ToLower() == "yes" || voteStr.ToLower() == "no";
            }
            return false;
        }
    }
} 