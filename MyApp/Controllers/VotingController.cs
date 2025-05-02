using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MyApp.Data;
using MyApp.Models;
using MyApp.Services;
using System.Security.Claims;

namespace MyApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VotingController : ControllerBase
    {
        private readonly IVoteService _voteService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VotingController> _logger;

        public VotingController(IVoteService voteService, ApplicationDbContext context, ILogger<VotingController> logger)
        {
            _voteService = voteService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("start")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> StartVoting()
        {
            var result = await _voteService.StartVotingAsync();
            if (result)
            {
                return Ok(new { message = "Voting started successfully" });
            }
            return BadRequest(new { message = "Failed to start voting" });
        }

        [HttpPost("stop")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> StopVoting()
        {
            var result = await _voteService.StopVotingAsync();
            if (result)
            {
                return Ok(new { message = "Voting stopped successfully" });
            }
            return BadRequest(new { message = "Failed to stop voting" });
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetVotingStatus()
        {
            try
            {
                var status = await _voteService.GetVotingStatusAsync();
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting voting status");
                return StatusCode(500, "An error occurred while retrieving voting status");
            }
        }

        [HttpGet("results")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetVotingResults()
        {
            try
            {
                var results = await _voteService.GetVotingResultsAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting voting results");
                return StatusCode(500, "An error occurred while retrieving voting results");
            }
        }

        [HttpPost("vote")]
        public async Task<IActionResult> CastVote([FromBody] VoteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized("User not authenticated");
                }

                var result = await _voteService.CastVoteAsync(int.Parse(userId), request.CandidateId, request.Vote);
                if (result)
                {
                    return Ok(new { message = "Vote cast successfully" });
                }
                return BadRequest("Unable to cast vote. Please check if voting is active and you haven't voted already.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error casting vote");
                return StatusCode(500, "An error occurred while casting vote");
            }
        }
    }

    public class VoteRequest
    {
        public int CandidateId { get; set; }
        public bool Vote { get; set; }
    }
} 