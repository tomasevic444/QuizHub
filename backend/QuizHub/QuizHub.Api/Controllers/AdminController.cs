// QuizHub.Api/Controllers/AdminController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizHub.Application.DTOs; // We can reuse QuizDto
using QuizHub.Core.Entities;
using QuizHub.Infrastructure.Data;

namespace QuizHub.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")] 
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AdminController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/Admin/quizzes
    [HttpGet("quizzes")]
    public async Task<ActionResult<IEnumerable<QuizDto>>> GetQuizzesForAdmin()
    {
        // Admins get a simple, unfiltered list of all quizzes
        var quizzes = await _context.Quizzes
            .Include(q => q.Category)
            .Include(q => q.Questions)
            .Select(q => new QuizDto(
                q.Id,
                q.Title,
                q.Description,
                q.Difficulty.ToString(),
                q.Questions.Count(),
                q.Category.Name,
                q.TimeLimitInSeconds,
                q.CategoryId
            ))
            .ToListAsync();

        return Ok(quizzes);
    }
    // GET: api/Admin/quizzes/{id}
    [HttpGet("quizzes/{id}")]
    public async Task<ActionResult<Quiz>> GetQuiz(int id)
    {
        var quiz = await _context.Quizzes.FindAsync(id);

        if (quiz == null)
        {
            return NotFound();
        }

        return quiz;
    }

    // POST: api/Admin/quizzes
    [HttpPost("quizzes")]
    public async Task<ActionResult<Quiz>> CreateQuiz(AdminQuizUpsertDto quizDto)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == quizDto.CategoryId);
        if (!categoryExists)
        {
            return BadRequest(new { message = "Invalid Category ID." });
        }

        var newQuiz = new Quiz
        {
            Title = quizDto.Title,
            Description = quizDto.Description,
            Difficulty = quizDto.Difficulty,
            TimeLimitInSeconds = quizDto.TimeLimitInSeconds,
            CategoryId = quizDto.CategoryId
        };

        _context.Quizzes.Add(newQuiz);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetQuiz), new { id = newQuiz.Id }, newQuiz);
    }

    // PUT: api/Admin/quizzes/{id}
    [HttpPut("quizzes/{id}")]
    public async Task<IActionResult> UpdateQuiz(int id, AdminQuizUpsertDto quizDto)
    {
        var quizToUpdate = await _context.Quizzes.FindAsync(id);
        if (quizToUpdate == null)
        {
            return NotFound();
        }

        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == quizDto.CategoryId);
        if (!categoryExists)
        {
            return BadRequest(new { message = "Invalid Category ID." });
        }

        quizToUpdate.Title = quizDto.Title;
        quizToUpdate.Description = quizDto.Description;
        quizToUpdate.Difficulty = quizDto.Difficulty;
        quizToUpdate.TimeLimitInSeconds = quizDto.TimeLimitInSeconds;
        quizToUpdate.CategoryId = quizDto.CategoryId;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Admin/quizzes/{id}
    [HttpDelete("quizzes/{id}")]
    public async Task<IActionResult> DeleteQuiz(int id)
    {
        var quizToDelete = await _context.Quizzes.FindAsync(id);
        if (quizToDelete == null)
        {
            return NotFound();
        }

        _context.Quizzes.Remove(quizToDelete);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}