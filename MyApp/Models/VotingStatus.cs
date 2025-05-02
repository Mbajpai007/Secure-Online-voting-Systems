using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace MyApp.Models
{
    public class VotingStatus
    {
        [Key]
        public int Id { get; set; }
        
        public bool IsVotingActive { get; set; }
        
        public DateTime? VotingStartTime { get; set; }
        
        public DateTime? VotingEndTime { get; set; }

        public int TotalVotes { get; set; }
        public List<CandidateResult> Candidates { get; set; } = new List<CandidateResult>();
    }
} 