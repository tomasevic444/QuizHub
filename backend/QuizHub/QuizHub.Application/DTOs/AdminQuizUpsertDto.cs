// QuizHub.Application/DTOs/AdminQuizUpsertDto.cs
using QuizHub.Core.Entities;
using System.ComponentModel.DataAnnotations;

namespace QuizHub.Application.DTOs;

public record AdminQuizUpsertDto(
    [Required] string Title,
    [Required] string Description,
    QuizDifficulty Difficulty,
    [Range(30, 3600)] int TimeLimitInSeconds,
    [Required] int CategoryId
);