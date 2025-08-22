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
    // GET: api/Users/me/results/{attemptId}
    [HttpGet("me/results/{attemptId}")]
    public async Task<ActionResult<QuizResultDto>> GetMyResultDetails(int attemptId)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return Unauthorized();

        // 1. Fetch the specific attempt, ensuring it belongs to the current user
        var attempt = await _context.QuizAttempts
            .Include(qa => qa.Quiz)
                .ThenInclude(q => q.Questions)
                    .ThenInclude(qu => qu.Options)
            .Include(qa => qa.UserAnswers)
            .FirstOrDefaultAsync(qa => qa.Id == attemptId && qa.UserId == userId);

        if (attempt == null)
        {
            return NotFound("Attempt not found or you do not have permission to view it.");
        }

        var questionResults = new List<QuestionResultDto>();
        var correctCount = 0;

        // 2. Loop through each question of the original quiz
        foreach (var question in attempt.Quiz.Questions)
        {
            var userAnswer = attempt.UserAnswers.FirstOrDefault(ua => ua.QuestionId == question.Id);
            var correctAnswers = question.Options.Where(o => o.IsCorrect).Select(o => o.Text).ToList();
            var userAnswersAsStrings = new List<string>();

            if (userAnswer != null)
            {
                if (userAnswer.IsCorrect) correctCount++;

                if (!string.IsNullOrEmpty(userAnswer.SelectedOptionIds))
                {
                    var selectedIds = userAnswer.SelectedOptionIds.Split(',').Select(int.Parse).ToHashSet();
                    userAnswersAsStrings = question.Options
                        .Where(o => selectedIds.Contains(o.Id))
                        .Select(o => o.Text)
                        .ToList();
                }
                else if (!string.IsNullOrEmpty(userAnswer.SubmittedText))
                {
                    userAnswersAsStrings.Add(userAnswer.SubmittedText);
                }
            }

            questionResults.Add(new QuestionResultDto(
                question.Text,
                userAnswersAsStrings,
                correctAnswers,
                userAnswer?.IsCorrect ?? false
            ));
        }

        // 3. Assemble and return the final DTO
        var resultDto = new QuizResultDto(
            attempt.Score,
            attempt.Quiz.Questions.Sum(q => q.Points),
            correctCount,
            attempt.Quiz.Questions.Count,
            questionResults
        );

        return Ok(resultDto);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim?.Value, out var userId) ? userId : null;
    }
}