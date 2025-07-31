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
    // GET: api/Admin/quizzes/{quizId}/questions
    [HttpGet("quizzes/{quizId}/questions")]
    public async Task<ActionResult<IEnumerable<Question>>> GetQuestionsForQuiz(int quizId)
    {
        var questions = await _context.Questions
            .Where(q => q.QuizId == quizId)
            .Include(q => q.Options)
            .ToListAsync();

        return Ok(questions);
    }

    // POST: api/Admin/quizzes/{quizId}/questions
    [HttpPost("quizzes/{quizId}/questions")]
    public async Task<ActionResult<Question>> CreateQuestion(int quizId, AdminQuestionUpsertDto questionDto)
    {
        var quiz = await _context.Quizzes.FindAsync(quizId);
        if (quiz == null) return NotFound("Quiz not found.");

        var newQuestion = new Question
        {
            QuizId = quizId,
            Text = questionDto.Text,
            Type = questionDto.Type,
            Points = questionDto.Points,
            Options = questionDto.Options.Select(o => new Option { Text = o.Text, IsCorrect = o.IsCorrect }).ToList()
        };

        _context.Questions.Add(newQuestion);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetQuestionsForQuiz), new { quizId = newQuestion.QuizId }, newQuestion);
    }

    // PUT: api/Admin/questions/{questionId} (Note the different route)
    [HttpPut("questions/{questionId}")]
    public async Task<IActionResult> UpdateQuestion(int questionId, AdminQuestionUpsertDto questionDto)
    {
        var questionToUpdate = await _context.Questions
            .Include(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == questionId);

        if (questionToUpdate == null) return NotFound();

        // Update question properties
        questionToUpdate.Text = questionDto.Text;
        questionToUpdate.Type = questionDto.Type;
        questionToUpdate.Points = questionDto.Points;

        _context.Options.RemoveRange(questionToUpdate.Options);
        questionToUpdate.Options = questionDto.Options
            .Select(o => new Option { Text = o.Text, IsCorrect = o.IsCorrect })
            .ToList();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Admin/questions/{questionId}
    [HttpDelete("questions/{questionId}")]
    public async Task<IActionResult> DeleteQuestion(int questionId)
    {
        var questionToDelete = await _context.Questions.FindAsync(questionId);
        if (questionToDelete == null) return NotFound();

        _context.Questions.Remove(questionToDelete);
        await _context.SaveChangesAsync();

        return NoContent();
    }
    // POST: api/Admin/categories
    [HttpPost("categories")]
    public async Task<ActionResult<Category>> CreateCategory([FromBody] string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new { message = "Category name cannot be empty." });
        }

        var existingCategory = await _context.Categories.FirstOrDefaultAsync(c => c.Name == name);
        if (existingCategory != null)
        {
            return Conflict(new { message = "A category with this name already exists." });
        }

        var newCategory = new Category { Name = name };
        _context.Categories.Add(newCategory);
        await _context.SaveChangesAsync();

        return Ok(newCategory);
    }

    // PUT: api/Admin/categories/{id}
    [HttpPut("categories/{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest(new { message = "Category name cannot be empty." });
        }

        var categoryToUpdate = await _context.Categories.FindAsync(id);
        if (categoryToUpdate == null)
        {
            return NotFound();
        }

        // Check if another category with the new name already exists
        var existingCategory = await _context.Categories.FirstOrDefaultAsync(c => c.Name == name && c.Id != id);
        if (existingCategory != null)
        {
            return Conflict(new { message = "A category with this name already exists." });
        }

        categoryToUpdate.Name = name;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/Admin/categories/{id}
    [HttpDelete("categories/{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var categoryToDelete = await _context.Categories.Include(c => c.Quizzes).FirstOrDefaultAsync(c => c.Id == id);
        if (categoryToDelete == null)
        {
            return NotFound();
        }

        if (categoryToDelete.Quizzes.Any())
        {
            return BadRequest(new { message = "Cannot delete a category that has quizzes assigned to it." });
        }

        _context.Categories.Remove(categoryToDelete);
        await _context.SaveChangesAsync();
        return NoContent();
    }
    // GET: api/Admin/results
    [HttpGet("results")]
    public async Task<ActionResult<IEnumerable<AdminQuizAttemptDto>>> GetAllResults()
    {
        var allAttempts = await _context.QuizAttempts
            .Include(qa => qa.Quiz)  
            .Include(qa => qa.User)  
            .OrderByDescending(qa => qa.AttemptedAt)
            .Select(qa => new AdminQuizAttemptDto(
                qa.Id,
                qa.Quiz.Title,
                qa.User.Username,
                qa.Score,
                qa.AttemptedAt
            ))
            .ToListAsync();

        return Ok(allAttempts);
    }
}
