// QuizHub.Api/Controllers/QuizzesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizHub.Application.DTOs;
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
    public async Task<ActionResult<IEnumerable<QuizDto>>> GetQuizzes()
    {
        var quizzes = await _context.Quizzes
            .Include(q => q.Category) // Eagerly load the related Category
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
}