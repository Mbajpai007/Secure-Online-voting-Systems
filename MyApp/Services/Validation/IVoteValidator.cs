using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Services.Validation
{
    public interface IVoteValidator
    {
        IVoteValidator SetNext(IVoteValidator validator);
        Task<ValidationResult> ValidateAsync(VoteValidationContext context);
    }

    public class VoteValidationContext
    {
        public int UserId { get; set; }
        public int CandidateId { get; set; }
        public bool VoteValue { get; set; }
        public string? DigitalSignature { get; set; }
        public string? IpAddress { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string? ErrorMessage { get; set; }
    }
} 