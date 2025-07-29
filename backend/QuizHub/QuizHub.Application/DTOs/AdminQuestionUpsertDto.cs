using QuizHub.Core.Entities;
namespace QuizHub.Application.DTOs;

public record AdminQuestionUpsertDto(
    string Text,
    QuestionType Type,
    int Points,
    List<AdminOptionUpsertDto> Options
);