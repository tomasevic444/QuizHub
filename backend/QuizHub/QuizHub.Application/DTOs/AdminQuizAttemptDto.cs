// QuizHub.Application/DTOs/AdminQuizAttemptDto.cs
namespace QuizHub.Application.DTOs;

public record AdminQuizAttemptDto(
    int AttemptId,
    string QuizTitle,
    string Username, 
    int Score,
    DateTime AttemptedAt
);