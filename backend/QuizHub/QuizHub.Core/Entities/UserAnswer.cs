// QuizHub.Core/Entities/UserAnswer.cs
namespace QuizHub.Core.Entities;

public class UserAnswer
{
    public int Id { get; set; }
    public string? SubmittedText { get; set; } // For FillInTheBlank answers
    public bool IsCorrect { get; set; }

    public int QuestionId { get; set; }
    public Question Question { get; set; } = null!;

    // This will hold the IDs of the options the user selected.
    // simple comma-separated string.
    public string? SelectedOptionIds { get; set; }

    public int QuizAttemptId { get; set; }
    public QuizAttempt QuizAttempt { get; set; } = null!;
}