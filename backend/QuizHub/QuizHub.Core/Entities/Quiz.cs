// QuizHub.Core/Entities/Quiz.cs
namespace QuizHub.Core.Entities;

public enum QuizDifficulty
{
    Easy,
    Medium,
    Hard
}

public class Quiz
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public QuizDifficulty Difficulty { get; set; }
    public int TimeLimitInSeconds { get; set; }

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!; // Navigation property

    public ICollection<Question> Questions { get; set; } = new List<Question>();

}