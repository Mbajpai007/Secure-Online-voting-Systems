using System.Collections.Generic;
using System.Threading.Tasks;
using MyApp.Models;

namespace MyApp.Services
{
    public interface ICandidateService
    {
        Task<IEnumerable<Candidate>> GetAllCandidatesAsync();
        Task<Candidate> GetCandidateByIdAsync(int id);
        Task<List<Candidate>> GetCandidatesByPartyAsync(string party);
        Task<Candidate> CreateCandidateAsync(CreateCandidateDto dto);
        Task<Candidate> UpdateCandidateAsync(int id, CreateCandidateDto dto);
        Task<bool> DeleteCandidateAsync(int id);
    }
} 