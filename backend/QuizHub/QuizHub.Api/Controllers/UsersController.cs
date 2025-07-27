// QuizHub.Api/Controllers/UsersController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizHub.Application.DTOs;
using QuizHub.Infrastructure.Data;
using System.Security.Claims;

namespace QuizHub.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // All endpoints in this controller require the user to be logged in
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Users/me/results
    [HttpGet("me/results")]
    public async Task<ActionResult<IEnumerable<QuizAttemptHistoryDto>>> GetMyResults()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        var attempts = await _context.QuizAttempts
            .Where(qa => qa.UserId == userId)
            .Include(qa => qa.Quiz) // We need the Quiz to get the title
                .ThenInclude(q => q.Questions) // We need Questions to get the total possible score
            .OrderByDescending(qa => qa.AttemptedAt)
            .Select(qa => new QuizAttemptHistoryDto(
                qa.Id,
                qa.Quiz.Title,
                qa.Score,
                qa.Quiz.Questions.Sum(q => q.Points), // Calculate total points
                                                      // Avoid division by zero if a quiz has no points
                qa.Quiz.Questions.Sum(q => q.Points) > 0
                    ? (double)qa.Score / qa.Quiz.Questions.Sum(q => q.Points) * 100
                    : 0,
                qa.AttemptedAt
            ))
            .ToListAsync();

        return Ok(attempts);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim?.Value, out var userId) ? userId : null;
    }
}