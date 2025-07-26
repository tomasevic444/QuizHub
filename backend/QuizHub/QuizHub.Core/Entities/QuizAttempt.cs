// QuizHub.Core/Entities/QuizAttempt.cs
namespace QuizHub.Core.Entities;

public class QuizAttempt
{
    public int Id { get; set; }
    public int Score { get; set; }
    public int TimeTakenInSeconds { get; set; }
    public DateTime AttemptedAt { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    public ICollection<UserAnswer> UserAnswers { get; set; } = new List<UserAnswer>();
}