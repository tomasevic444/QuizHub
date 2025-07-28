// QuizHub.Api/Controllers/AdminController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizHub.Application.DTOs; // We can reuse QuizDto
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
                q.Category.Name
            ))
            .ToListAsync();

        return Ok(quizzes);
    }
}