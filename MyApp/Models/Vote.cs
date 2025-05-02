using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Models
{
    public class Vote
    {
        [Key]
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public int CandidateId { get; set; }
        public Candidate Candidate { get; set; } = null!;
        
        public bool VoteValue { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }
} 