// QuizHub.Application/DTOs/QuizAttemptHistoryDto.cs
namespace QuizHub.Application.DTOs;

public record QuizAttemptHistoryDto(
    int AttemptId,
    string QuizTitle,
    int Score,
    int TotalPossibleScore,
    double Percentage,
    DateTime AttemptedAt
);