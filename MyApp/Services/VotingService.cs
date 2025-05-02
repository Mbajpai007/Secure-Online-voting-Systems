using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyApp.Data;
using MyApp.Models;
using MyApp.Services.Notifications;
using MyApp.Services.Validation;
using System.Linq;
using System.Collections.Generic;

namespace MyApp.Services
{
    public class VotingService : IVoteService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VotingService> _logger;
        private readonly IEmailService _emailService;
        private readonly ElectionSubject _electionSubject;

        public VotingService(
            ApplicationDbContext context,
            ILogger<VotingService> logger,
            IEmailService emailService,
            ElectionSubject electionSubject)
        {
            _context = context;
            _logger = logger;
            _emailService = emailService;
            _electionSubject = electionSubject;
        }

        public async Task<IEnumerable<Candidate>> GetAllCandidatesAsync()
        {
            // Always exclude vote counts for voters
            return await _context.Candidates
                .Where(c => c.IsActive)
                .Select(c => new Candidate
                {
                    Id = c.Id,
                    Name = c.Name,
                    Party = c.Party,
                    Description = c.Description,
                    IsActive = c.IsActive,
                    VoteCount = 0 // Always set to 0 for voters
                })
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<VotingStatus> GetVotingStatusAsync()
        {
            var isActive = await IsVotingActiveAsync();
            var candidates = await _context.Candidates
                .Where(c => c.IsActive)
                .Select(c => new CandidateResult
                {
                    Id = c.Id,
                    Name = c.Name,
                    Party = c.Party,
                    VoteCount = 0 // Always hide vote counts for voters
                })
                .ToListAsync();

            return new VotingStatus
            {
                IsVotingActive = isActive,
                TotalVotes = 0, // Always hide total votes for voters
                Candidates = candidates
            };
        }

        public async Task<bool> CastVoteAsync(int userId, int candidateId, bool vote)
        {
            if (!await IsVotingActiveAsync())
            {
                _logger.LogWarning("Attempted to cast vote while voting is inactive");
                return false;
            }

            // Create validation context
            var context = new VoteValidationContext
            {
                UserId = userId,
                CandidateId = candidateId,
                VoteValue = vote,
                Timestamp = DateTime.UtcNow,
                DigitalSignature = "TODO: Implement digital signature", // TODO: Get from request
                IpAddress = "TODO: Get from request" // TODO: Get from request
            };

            // Create and chain validators
            var signatureValidator = new SignatureValidator();
            var eligibilityValidator = new EligibilityValidator(_context);
            var tamperValidator = new TamperValidator();

            signatureValidator
                .SetNext(eligibilityValidator)
                .SetNext(tamperValidator);

            // Run validation chain
            var validationResult = await signatureValidator.ValidateAsync(context);
            if (!validationResult.IsValid)
            {
                _logger.LogWarning($"Vote validation failed: {validationResult.ErrorMessage}");
                return false;
            }

            var candidate = await _context.Candidates.FindAsync(candidateId);
            if (candidate == null || !candidate.IsActive)
            {
                _logger.LogWarning($"Invalid candidate ID: {candidateId}");
                return false;
            }

            var newVote = new Vote
            {
                UserId = userId,
                CandidateId = candidateId,
                VoteValue = vote,
                CreatedAt = DateTime.UtcNow
            };

            _context.Votes.Add(newVote);
            candidate.VoteCount++;
            await _context.SaveChangesAsync();

            await _electionSubject.NotifyObserversAsync(new ElectionEvent
            {
                EventType = "VoteSubmitted",
                Message = $"New vote cast for candidate {candidate.Name}",
                Data = new { CandidateId = candidateId, VoteCount = candidate.VoteCount }
            });

            return true;
        }

        public async Task<bool> StartVotingAsync()
        {
            if (await IsVotingActiveAsync())
            {
                _logger.LogWarning("Attempted to start voting while it's already active");
                return false;
            }

            var settings = await _context.VotingSettings.FirstOrDefaultAsync();
            if (settings == null)
            {
                settings = new VotingSettings { IsActive = true };
                _context.VotingSettings.Add(settings);
            }
            else
            {
                settings.IsActive = true;
            }

            var status = await _context.VotingStatus.FirstOrDefaultAsync();
            if (status == null)
            {
                status = new VotingStatus
                {
                    IsVotingActive = true,
                    VotingStartTime = DateTime.UtcNow,
                    VotingEndTime = null
                };
                _context.VotingStatus.Add(status);
            }
            else
            {
                status.IsVotingActive = true;
                status.VotingStartTime = DateTime.UtcNow;
                status.VotingEndTime = null;
            }

            await _context.SaveChangesAsync();

            await _electionSubject.NotifyObserversAsync(new ElectionEvent
            {
                EventType = "VotingStarted",
                Message = "Voting has started",
                Data = new { StartTime = DateTime.UtcNow }
            });

            return true;
        }

        public async Task<bool> StopVotingAsync()
        {
            if (!await IsVotingActiveAsync())
            {
                _logger.LogWarning("Attempted to stop voting while it's already inactive");
                return false;
            }

            var settings = await _context.VotingSettings.FirstOrDefaultAsync();
            if (settings != null)
            {
                settings.IsActive = false;
            }

            var status = await _context.VotingStatus.FirstOrDefaultAsync();
            if (status != null)
            {
                status.IsVotingActive = false;
                status.VotingEndTime = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            await _electionSubject.NotifyObserversAsync(new ElectionEvent
            {
                EventType = "VotingEnded",
                Message = "Voting has ended",
                Data = new { EndTime = DateTime.UtcNow }
            });

            return true;
        }

        public async Task<bool> IsVotingActiveAsync()
        {
            var settings = await _context.VotingSettings.FirstOrDefaultAsync();
            return settings?.IsActive ?? false;
        }

        public async Task<VotingStatus> GetVotingStatus()
        {
            try
            {
                var status = await _context.VotingStatus.FirstOrDefaultAsync();
                if (status == null)
                {
                    status = new VotingStatus
                    {
                        IsVotingActive = false,
                        VotingStartTime = null,
                        VotingEndTime = null
                    };
                    _context.VotingStatus.Add(status);
                    await _context.SaveChangesAsync();
                }
                return status;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting voting status");
                return new VotingStatus { IsVotingActive = false };
            }
        }

        public async Task<VotingStatus> GetVotingResultsAsync()
        {
            var status = await GetVotingStatusAsync();
            if (!status.IsVotingActive)
            {
                // Only return results if voting has ended
                var totalVotes = await _context.Votes.CountAsync();
                var candidates = await _context.Candidates
                    .Where(c => c.IsActive)
                    .Select(c => new CandidateResult
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Party = c.Party,
                        VoteCount = c.VoteCount
                    })
                    .OrderByDescending(c => c.VoteCount)
                    .ToListAsync();

                status.TotalVotes = totalVotes;
                status.Candidates = candidates;
            }
            return status;
        }
    }
} 