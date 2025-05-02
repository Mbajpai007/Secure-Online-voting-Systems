using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Services;
using MyApp.Models;
using System.Security.Claims;

namespace MyApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "voter")]
    public class VoterController : ControllerBase
    {
        private readonly IVoteService _voteService;
        private readonly ILogger<VoterController> _logger;

        public VoterController(IVoteService voteService, ILogger<VoterController> logger)
        {
            _voteService = voteService;
            _logger = logger;
        }

        [HttpGet("candidates")]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetCandidates()
        {
            try
            {
                var candidates = await _voteService.GetAllCandidatesAsync();
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting candidates");
                return StatusCode(500, "Error retrieving candidates");
            }
        }

        [HttpGet("voting-status")]
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

        [HttpGet("results")]
        public async Task<ActionResult<VotingStatus>> GetVotingResults()
        {
            try
            {
                var results = await _voteService.GetVotingResultsAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting voting results");
                return StatusCode(500, "Error retrieving voting results");
            }
        }

        [HttpPost("vote")]
        public async Task<IActionResult> CastVote([FromBody] VoteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid vote request model state");
                    return BadRequest(new { message = "Invalid vote request" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("User not authenticated when attempting to vote");
                    return Unauthorized(new { message = "User not authenticated" });
                }

                if (!int.TryParse(userId, out int parsedUserId))
                {
                    _logger.LogError($"Failed to parse user ID: {userId}");
                    return BadRequest(new { message = "Invalid user ID" });
                }

                var result = await _voteService.CastVoteAsync(parsedUserId, request.CandidateId, request.Vote);
                if (result)
                {
                    return Ok(new { message = "Vote cast successfully" });
                }

                _logger.LogWarning($"Failed to cast vote for user {userId} and candidate {request.CandidateId}");
                return BadRequest(new { message = "Unable to cast vote. Please check if voting is active and you haven't voted already." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error casting vote");
                return StatusCode(500, new { message = "An error occurred while casting vote" });
            }
        }

        public class VoteRequest
        {
            public int CandidateId { get; set; }
            public bool Vote { get; set; }
        }
    }
} 