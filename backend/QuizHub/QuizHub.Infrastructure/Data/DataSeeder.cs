// QuizHub.Infrastructure/Data/DataSeeder.cs

using Microsoft.EntityFrameworkCore;
using QuizHub.Core.Entities;

namespace QuizHub.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {

        if (await context.Users.AnyAsync())
        {
            return;
        }

        var adminUser = new User
        {
            Username = "admin",
            Email = "admin@quizhub.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "Admin"
        };
        await context.Users.AddAsync(adminUser);

        var testUser = new User
        {
            Username = "nikola",
            Email = "nikola@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("nikola123"),
            Role = "User"
        };
        await context.Users.AddAsync(testUser);

        var categories = new List<Category>
        {
            new Category { Name = "Programming" },
            new Category { Name = "History" },
            new Category { Name = "Science" },
            new Category { Name = "Geography" },
            new Category { Name = "General Knowledge" }
        };
        await context.Categories.AddRangeAsync(categories);

        await context.SaveChangesAsync();

        var programmingCatId = categories.First(c => c.Name == "Programming").Id;
        var historyCatId = categories.First(c => c.Name == "History").Id;
        var scienceCatId = categories.First(c => c.Name == "Science").Id;
        var geographyCatId = categories.First(c => c.Name == "Geography").Id;
        var generalCatId = categories.First(c => c.Name == "General Knowledge").Id;

        var quizzes = new List<Quiz>
        {
            new Quiz { Title = "C# Fundamentals", Description = "Test your basic knowledge of C# and .NET.", Difficulty = QuizDifficulty.Easy, TimeLimitInSeconds = 300, CategoryId = programmingCatId },
            new Quiz { Title = "World War II", Description = "Key events and figures from the largest conflict in history.", Difficulty = QuizDifficulty.Medium, TimeLimitInSeconds = 450, CategoryId = historyCatId },
            new Quiz { Title = "Human Anatomy 101", Description = "A basic quiz about the systems of the human body.", Difficulty = QuizDifficulty.Medium, TimeLimitInSeconds = 400, CategoryId = scienceCatId },
            new Quiz { Title = "European Capitals", Description = "How well do you know the capitals of Europe?", Difficulty = QuizDifficulty.Easy, TimeLimitInSeconds = 240, CategoryId = geographyCatId },
            new Quiz { Title = "React Hooks", Description = "Test your knowledge of React's powerful hook system.", Difficulty = QuizDifficulty.Hard, TimeLimitInSeconds = 600, CategoryId = programmingCatId },
            new Quiz { Title = "Ancient Rome", Description = "From the Republic to the Empire.", Difficulty = QuizDifficulty.Hard, TimeLimitInSeconds = 500, CategoryId = historyCatId },
            new Quiz { Title = "Trivia Night", Description = "A mix of fun trivia questions to test your wits.", Difficulty = QuizDifficulty.Medium, TimeLimitInSeconds = 600, CategoryId = generalCatId }
        };
        await context.Quizzes.AddRangeAsync(quizzes);

        await context.SaveChangesAsync();

        var csharpQuizId = quizzes.First(q => q.Title == "C# Fundamentals").Id;
        var capitalsQuizId = quizzes.First(q => q.Title == "European Capitals").Id;
        var triviaQuizId = quizzes.First(q => q.Title == "Trivia Night").Id;

        var allQuestions = new List<Question>
        {
            new Question { QuizId = csharpQuizId, Text = "What keyword is used to declare a variable that cannot be reassigned?", Type = QuestionType.SingleChoice, Points = 10, Options = new List<Option> { new Option { Text = "var", IsCorrect = false }, new Option { Text = "let", IsCorrect = false }, new Option { Text = "const", IsCorrect = true }, new Option { Text = "static", IsCorrect = false }}},
            new Question { QuizId = csharpQuizId, Text = "Which of the following are value types in C#?", Type = QuestionType.MultipleChoice, Points = 15, Options = new List<Option> { new Option { Text = "int", IsCorrect = true }, new Option { Text = "string", IsCorrect = false }, new Option { Text = "class", IsCorrect = false }, new Option { Text = "struct", IsCorrect = true }}},
            new Question { QuizId = csharpQuizId, Text = "C# is a statically-typed language.", Type = QuestionType.TrueFalse, Points = 5, Options = new List<Option> { new Option { Text = "True", IsCorrect = true }, new Option { Text = "False", IsCorrect = false }}},
            new Question { QuizId = csharpQuizId, Text = "What class is the base for all types in the .NET type system?", Type = QuestionType.FillInTheBlank, Points = 10, Options = new List<Option> { new Option { Text = "Object", IsCorrect = true }, new Option { Text = "System.Object", IsCorrect = true }}},

            new Question { QuizId = capitalsQuizId, Text = "What is the capital of Spain?", Type = QuestionType.SingleChoice, Points = 10, Options = new List<Option> { new Option { Text = "Barcelona", IsCorrect = false }, new Option { Text = "Madrid", IsCorrect = true }, new Option { Text = "Lisbon", IsCorrect = false }, new Option { Text = "Seville", IsCorrect = false }}},
            new Question { QuizId = capitalsQuizId, Text = "What is the capital of Germany?", Type = QuestionType.FillInTheBlank, Points = 10, Options = new List<Option> { new Option { Text = "Berlin", IsCorrect = true }}},
            new Question { QuizId = capitalsQuizId, Text = "Paris is the capital of Italy.", Type = QuestionType.TrueFalse, Points = 5, Options = new List<Option> { new Option { Text = "True", IsCorrect = false }, new Option { Text = "False", IsCorrect = true }}},
            new Question { QuizId = capitalsQuizId, Text = "What is the capital of Norway?", Type = QuestionType.SingleChoice, Points = 10, Options = new List<Option> { new Option { Text = "Stockholm", IsCorrect = false }, new Option { Text = "Copenhagen", IsCorrect = false }, new Option { Text = "Helsinki", IsCorrect = false }, new Option { Text = "Oslo", IsCorrect = true }}},
            
            // Trivia Pitanja
            new Question { QuizId = triviaQuizId, Text = "How many planets are in our Solar System?", Type = QuestionType.FillInTheBlank, Points = 10, Options = new List<Option> { new Option { Text = "8", IsCorrect = true }, new Option { Text = "eight", IsCorrect = true }}},
            new Question { QuizId = triviaQuizId, Text = "Which of the following are primary colors (in the additive model)?", Type = QuestionType.MultipleChoice, Points = 10, Options = new List<Option> { new Option { Text = "Red", IsCorrect = true }, new Option { Text = "Green", IsCorrect = true }, new Option { Text = "Blue", IsCorrect = true }, new Option { Text = "Yellow", IsCorrect = false }}},
            new Question { QuizId = triviaQuizId, Text = "The Great Wall of China is visible from space with the naked eye.", Type = QuestionType.TrueFalse, Points = 5, Options = new List<Option> { new Option { Text = "True", IsCorrect = false }, new Option { Text = "False", IsCorrect = true }}}
        };
        await context.Questions.AddRangeAsync(allQuestions);

        await context.SaveChangesAsync();
    }
}