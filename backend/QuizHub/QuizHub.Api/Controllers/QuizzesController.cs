// QuizHub.Api/Controllers/QuizzesController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizHub.Application.DTOs;
using QuizHub.Core.Entities;
using QuizHub.Infrastructure.Data;
using System.Security.Claims;

namespace QuizHub.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class QuizzesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IQuizService _quizService;

    public QuizzesController(ApplicationDbContext context, IQuizService quizService)
    {
        _context = context;
        _quizService = quizService;
    }

    // GET: api/Quizzes
    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuizDto>>> GetQuizzes(
     [FromQuery] string? category,
     [FromQuery] string? difficulty,
     [FromQuery] string? searchTerm)
    {
        // 1. Start with the base DbSet
        IQueryable<Quiz> query = _context.Quizzes;

        // 2. Eagerly load related data that you will need for filtering or selecting.
        query = query.Include(q => q.Category)
                     .Include(q => q.Questions);

        // 3. Apply filters to the IQueryable<Quiz>
        if (!string.IsNullOrEmpty(category))
        {
            // Filter on the navigation property
            query = query.Where(q => q.Category.Name == category);
        }

        if (!string.IsNullOrEmpty(difficulty) && Enum.TryParse<QuizDifficulty>(difficulty, true, out var parsedDifficulty))
        {
            // Filter on the Quiz entity's property
            query = query.Where(q => q.Difficulty == parsedDifficulty);
        }

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(q =>
                q.Title.Contains(searchTerm) ||
                q.Description.Contains(searchTerm));
        }

        // 4. Now, after all filtering is done, project the result to your DTO
        // and execute the query against the database.
        var quizzes = await query
            .Select(q => new QuizDto(
                q.Id,
                q.Title,
                q.Description,
                q.Difficulty.ToString(),
                q.Questions.Count(), // This will now be translated to SQL correctly
                q.Category.Name,
                q.TimeLimitInSeconds,
            q.CategoryId
            ))
            .ToListAsync();

        return Ok(quizzes);
    }
    // GET: api/Quizzes/categories
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var categories = await _context.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name))
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuizTakerViewDto>> GetQuizForTaker(int id)
    {
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
                .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quiz == null)
        {
            return NotFound();
        }

        // Map the entities to our "safe" DTOs
        var quizDto = new QuizTakerViewDto(
            quiz.Id,
            quiz.Title,
            quiz.TimeLimitInSeconds,
            quiz.Questions.Select(q => new QuizTakerQuestionDto(
                q.Id,
                q.Text,
                q.Type.ToString(),
                q.Points,
                q.Options.Select(o => new QuizTakerOptionDto(o.Id, o.Text)).ToList()
            )).ToList()
        );

        return Ok(quizDto);
    }
    [HttpPost("{id}/submit")]
    [Authorize] // IMPORTANT: Only logged-in users can submit quizzes.
    public async Task<ActionResult<QuizResultDto>> SubmitQuiz(int id, QuizSubmissionDto submission)
    {
        // Get user ID from the JWT token.
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized();
        }

        try
        {
            var result = await _quizService.SubmitQuizAsync(id, userId, submission);
            return Ok(result);
        }
        catch (Exception e)
        {
            return BadRequest(new { message = e.Message });
        }
    }
    [HttpGet("{id}/leaderboard")]
    public async Task<ActionResult<IEnumerable<LeaderboardEntryDto>>> GetLeaderboard(
     int id,
     [FromQuery] int topN = 10,
     [FromQuery] string period = "alltime") 
    {
        var totalPossibleScore = await _context.Questions
            .Where(q => q.QuizId == id)
            .SumAsync(q => q.Points);

        if (totalPossibleScore == 0)
        {
            return Ok(Enumerable.Empty<LeaderboardEntryDto>());
        }

        IQueryable<QuizAttempt> attemptsQuery = _context.QuizAttempts
            .AsNoTracking()
            .Where(qa => qa.QuizId == id && qa.User != null);

        // Calculate the start date based on the period
        DateTime? startDate = null;
        switch (period.ToLower())
        {
            case "weekly":
                startDate = DateTime.UtcNow.AddDays(-7);
                break;
            case "monthly":
                startDate = DateTime.UtcNow.AddMonths(-1);
                break;
        }

        // If a start date is set, apply the date filter to the query
        if (startDate.HasValue)
        {
            attemptsQuery = attemptsQuery.Where(qa => qa.AttemptedAt >= startDate.Value);
        }

        // fetch the filtered attempts from the database
        var filteredAttempts = await attemptsQuery
            .Include(qa => qa.User)
            .ToListAsync();

        var topScores = filteredAttempts
            .GroupBy(qa => qa.UserId)
            .Select(userGroup => userGroup
                .OrderByDescending(qa => qa.Score)
                .ThenBy(qa => qa.TimeTakenInSeconds)
                .First())
            .OrderByDescending(qa => qa.Score)
            .ThenBy(qa => qa.TimeTakenInSeconds)
            .Take(topN)
            .ToList();

        var leaderboard = topScores.Select((attempt, index) => new LeaderboardEntryDto(
            index + 1,
            attempt.User.Username,
            attempt.Score,
            Math.Round((double)attempt.Score / totalPossibleScore * 100, 2),
            attempt.TimeTakenInSeconds,
            attempt.AttemptedAt
        ));

        return Ok(leaderboard);
    }
}