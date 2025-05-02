using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Services
{
    public interface IVoteService
    {
        Task<IEnumerable<Candidate>> GetAllCandidatesAsync();
        Task<VotingStatus> GetVotingStatusAsync();
        Task<bool> CastVoteAsync(int userId, int candidateId, bool vote);
        Task<bool> StartVotingAsync();
        Task<bool> StopVotingAsync();
        Task<bool> IsVotingActiveAsync();
        Task<VotingStatus> GetVotingResultsAsync();
    }
}
