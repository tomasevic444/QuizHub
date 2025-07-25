// QuizHub.Api/Controllers/QuizzesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizHub.Application.DTOs;
using QuizHub.Core.Entities;
using QuizHub.Infrastructure.Data;

namespace QuizHub.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class QuizzesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public QuizzesController(ApplicationDbContext context)
    {
        _context = context;
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
                q.Category.Name
            ))
            .ToListAsync();

        return Ok(quizzes);
    }
    // GET: api/Quizzes/categories
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _context.Categories
            .Select(c => c.Name)
            .OrderBy(name => name)
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
}