// QuizHub.Core/Entities/Option.cs
namespace QuizHub.Core.Entities;

public class Option
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsCorrect { get; set; } // Marks the correct answer(s)

    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;
}