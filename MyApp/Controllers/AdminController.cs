using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Models;
using MyApp.Services;
using Microsoft.Extensions.Logging;

namespace MyApp.Controllers
{
    [Authorize(Roles = "admin")]
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IVoteService _voteService;
        private readonly ICandidateService _candidateService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IVoteService voteService,
            ICandidateService candidateService,
            ILogger<AdminController> logger)
        {
            _voteService = voteService;
            _candidateService = candidateService;
            _logger = logger;
        }

        [HttpGet("candidates")]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetAllCandidates()
        {
            try
            {
                var candidates = await _candidateService.GetAllCandidatesAsync();
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting candidates");
                return StatusCode(500, "Error retrieving candidates");
            }
        }

        [HttpPost("candidates")]
        public async Task<ActionResult<Candidate>> CreateCandidate([FromBody] CreateCandidateDto dto)
        {
            try
            {
                var isVotingActive = await _voteService.IsVotingActiveAsync();
                if (isVotingActive)
                {
                    return BadRequest("Cannot create candidates while voting is active");
                }

                var candidate = await _candidateService.CreateCandidateAsync(dto);
                return CreatedAtAction(nameof(GetAllCandidates), new { id = candidate.Id }, candidate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating candidate");
                return StatusCode(500, "Error creating candidate");
            }
        }

        [HttpGet("candidates/{id}")]
        public async Task<ActionResult<Candidate>> GetCandidate(int id)
        {
            var candidate = await _candidateService.GetCandidateByIdAsync(id);
            if (candidate == null)
            {
                return NotFound();
            }
            return Ok(candidate);
        }

        [HttpPut("candidates/{id}")]
        public async Task<ActionResult<Candidate>> UpdateCandidate(int id, [FromBody] CreateCandidateDto dto)
        {
            try
            {
                var isVotingActive = await _voteService.IsVotingActiveAsync();
                if (isVotingActive)
                {
                    return BadRequest("Cannot update candidates while voting is active");
                }

                var candidate = await _candidateService.UpdateCandidateAsync(id, dto);
                if (candidate == null)
                {
                    return NotFound();
                }
                return Ok(candidate);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating candidate");
                return StatusCode(500, "Error updating candidate");
            }
        }

        [HttpDelete("candidates/{id}")]
        public async Task<ActionResult> DeleteCandidate(int id)
        {
            try
            {
                var isVotingActive = await _voteService.IsVotingActiveAsync();
                if (isVotingActive)
                {
                    return BadRequest("Cannot delete candidates while voting is active");
                }

                var result = await _candidateService.DeleteCandidateAsync(id);
                if (!result)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting candidate");
                return StatusCode(500, "Error deleting candidate");
            }
        }

        [HttpGet("candidates/party/{party}")]
        public async Task<ActionResult<List<Candidate>>> GetCandidatesByParty(string party)
        {
            try
            {
                _logger.LogInformation($"Fetching candidates for party: {party}");
                var candidates = await _candidateService.GetCandidatesByPartyAsync(party);
                _logger.LogInformation($"Found {candidates.Count} candidates for party {party}");
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching candidates for party {party}");
                return StatusCode(500, "An error occurred while fetching candidates");
            }
        }

        [HttpPost("voting/start")]
        public async Task<ActionResult> StartVoting()
        {
            try
            {
                var result = await _voteService.StartVotingAsync();
                if (result)
                {
                    return Ok(new { message = "Voting started successfully" });
                }
                return BadRequest(new { message = "Failed to start voting" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting voting");
                return StatusCode(500, "Error starting voting");
            }
        }

        [HttpPost("voting/stop")]
        public async Task<ActionResult> StopVoting()
        {
            try
            {
                var result = await _voteService.StopVotingAsync();
                if (result)
                {
                    return Ok(new { message = "Voting stopped successfully" });
                }
                return BadRequest(new { message = "Failed to stop voting" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping voting");
                return StatusCode(500, "Error stopping voting");
            }
        }

        [HttpGet("voting/status")]
        public async Task<ActionResult<VotingStatus>> GetVotingStatus()
        {
            try
            {
                var status = await _voteService.GetVotingStatusAsync();
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting voting status");
                return StatusCode(500, "Error retrieving voting status");
            }
        }
    }
} 