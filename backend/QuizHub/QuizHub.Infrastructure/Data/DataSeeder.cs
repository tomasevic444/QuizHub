// QuizHub.Infrastructure/Data/DataSeeder.cs
using Microsoft.EntityFrameworkCore;
using QuizHub.Core.Entities;

namespace QuizHub.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Only seed if there are no quizzes
        if (await context.Quizzes.AnyAsync())
        {
            return;
        }

        if (!await context.Users.AnyAsync(u => u.Role == "Admin"))
        {
            var adminUser = new User
            {
                Username = "admin",
                Email = "admin@quizhub.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "Admin"
            };
            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();
        }


        var categories = new List<Category>
        {
            new Category { Name = "Programming" },
            new Category { Name = "History" },
            new Category { Name = "Science" }
        };
        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync(); // Save to get Category IDs

        var quizzes = new List<Quiz>
        {
            new Quiz { Title = "C# Fundamentals", Description = "Test your basic knowledge of C#.", Difficulty = QuizDifficulty.Easy, TimeLimitInSeconds = 300, CategoryId = categories[0].Id },
            new Quiz { Title = "React Hooks", Description = "How well do you know React Hooks?", Difficulty = QuizDifficulty.Medium, TimeLimitInSeconds = 600, CategoryId = categories[0].Id },
            new Quiz { Title = "World War II", Description = "Key events and figures from WWII.", Difficulty = QuizDifficulty.Medium, TimeLimitInSeconds = 450, CategoryId = categories[1].Id },
            new Quiz { Title = "Human Anatomy", Description = "A quiz about the human body.", Difficulty = QuizDifficulty.Hard, TimeLimitInSeconds = 700, CategoryId = categories[2].Id },
            new Quiz { Title = "JavaScript Essentials", Description = "Covers the core concepts of JavaScript.", Difficulty = QuizDifficulty.Easy, TimeLimitInSeconds = 500, CategoryId = categories[0].Id },
        };
        await context.Quizzes.AddRangeAsync(quizzes);
        await context.SaveChangesAsync();

        // --- NEW CODE STARTS HERE ---
        if (await context.Questions.AnyAsync()) return; // Don't seed if questions exist

        var csharpQuiz = await context.Quizzes.FirstOrDefaultAsync(q => q.Title == "C# Fundamentals");

        if (csharpQuiz != null)
        {
            var questions = new List<Question>
        {
            new Question
            {
                QuizId = csharpQuiz.Id,
                Text = "What keyword is used to declare a variable that cannot be reassigned?",
                Type = QuestionType.SingleChoice,
                Points = 10,
                Options = new List<Option>
                {
                    new Option { Text = "var", IsCorrect = false },
                    new Option { Text = "let", IsCorrect = false },
                    new Option { Text = "const", IsCorrect = true },
                    new Option { Text = "static", IsCorrect = false },
                }
            },
            new Question
            {
                QuizId = csharpQuiz.Id,
                Text = "Which of the following are value types in C#?",
                Type = QuestionType.MultipleChoice,
                Points = 15,
                Options = new List<Option>
                {
                    new Option { Text = "int", IsCorrect = true },
                    new Option { Text = "string", IsCorrect = false },
                    new Option { Text = "class", IsCorrect = false },
                    new Option { Text = "struct", IsCorrect = true },
                }
            },
            new Question
            {
                QuizId = csharpQuiz.Id,
                Text = "C# is a statically-typed language.",
                Type = QuestionType.TrueFalse,
                Points = 5,
                Options = new List<Option>
                {
                    new Option { Text = "True", IsCorrect = true },
                    new Option { Text = "False", IsCorrect = false },
                }
            },
            new Question
            {
                QuizId = csharpQuiz.Id,
                Text = "What class is the base for all types in the .NET type system?",
                Type = QuestionType.FillInTheBlank,
                Points = 10,
                Options = new List<Option>
                {
                    // For FillInTheBlank, the correct answer is stored in the options text.
                    // We can have multiple correct answers if needed.
                    new Option { Text = "Object", IsCorrect = true },
                    new Option { Text = "System.Object", IsCorrect = true } // Alternative correct answer
                }
            }
        };
            await context.Questions.AddRangeAsync(questions);
            await context.SaveChangesAsync();
        }
    }
}