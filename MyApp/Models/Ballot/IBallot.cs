using System.Collections.Generic;

namespace MyApp.Models.Ballot
{
    public interface IBallot
    {
        int Id { get; set; }
        string Title { get; set; }
        string Description { get; set; }
        List<Candidate> Candidates { get; set; }
        BallotType Type { get; }
        bool ValidateVote(object vote);
    }

    public enum BallotType
    {
        YesNo,
        RankedChoice,
        MultipleChoice
    }
} 