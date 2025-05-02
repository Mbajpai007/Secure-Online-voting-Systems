using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyApp.Data;
using MyApp.Models;

namespace MyApp.Services
{
    public class CandidateService : ICandidateService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<CandidateService> _logger;

        public CandidateService(ApplicationDbContext context, ILogger<CandidateService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Candidate>> GetAllCandidatesAsync()
        {
            return await _context.Candidates
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Candidate> GetCandidateByIdAsync(int id)
        {
            return await _context.Candidates
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
        }

        public async Task<List<Candidate>> GetCandidatesByPartyAsync(string party)
        {
            return await _context.Candidates
                .Where(c => c.Party == party && c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Candidate> CreateCandidateAsync(CreateCandidateDto dto)
        {
            var candidate = new Candidate
            {
                Name = dto.Name,
                Party = dto.Party,
                Description = dto.Description,
                IsActive = true,
                VoteCount = 0
            };

            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();
            return candidate;
        }

        public async Task<Candidate> UpdateCandidateAsync(int id, CreateCandidateDto dto)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null || !candidate.IsActive)
            {
                return null;
            }

            candidate.Name = dto.Name;
            candidate.Party = dto.Party;
            candidate.Description = dto.Description;

            await _context.SaveChangesAsync();
            return candidate;
        }

        public async Task<bool> DeleteCandidateAsync(int id)
        {
            var candidate = await _context.Candidates.FindAsync(id);
            if (candidate == null || !candidate.IsActive)
            {
                return false;
            }

            candidate.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 