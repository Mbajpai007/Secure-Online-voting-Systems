namespace MyApp.Models
{
    public class CandidateResult
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Party { get; set; } = string.Empty;
        public int VoteCount { get; set; }
    }
} 