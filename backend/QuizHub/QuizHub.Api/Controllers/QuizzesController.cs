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
        // Start with a base query
        var query = _context.Quizzes.Include(q => q.Category).AsQueryable();

        // 1. Filter by Category
        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(q => q.Category.Name == category);
        }

        // 2. Filter by Difficulty
        if (!string.IsNullOrEmpty(difficulty) && Enum.TryParse<QuizDifficulty>(difficulty, true, out var parsedDifficulty))
        {
            query = query.Where(q => q.Difficulty == parsedDifficulty);
        }

        // 3. Filter by Search Term (in Title or Description)
        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(q =>
                q.Title.Contains(searchTerm) ||
                q.Description.Contains(searchTerm));
        }

        // Execute the final query
        var quizzes = await query
            .Select(q => new QuizDto(
                q.Id,
                q.Title,
                q.Description,
                q.Difficulty.ToString(),
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
}