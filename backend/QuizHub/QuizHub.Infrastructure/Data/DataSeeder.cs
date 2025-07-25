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
    }
}