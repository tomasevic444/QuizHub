// QuizHub.Application/DTOs/QuizDto.cs
namespace QuizHub.Application.DTOs;

public record QuizDto(
    int Id,
    string Title,
    string Description,
    string Difficulty, 
    int NumberOfQuestions,
    string CategoryName
);