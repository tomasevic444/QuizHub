// QuizHub.Application/DTOs/QuizDto.cs
namespace QuizHub.Application.DTOs;

public record QuizDto(
    int Id,
    string Title,
    string Description,
    string Difficulty, // We'll send the string name, not the number
    string CategoryName
);