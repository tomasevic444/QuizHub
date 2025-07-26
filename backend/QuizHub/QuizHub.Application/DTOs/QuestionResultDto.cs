public record QuestionResultDto(
    string QuestionText,
    List<string> UserAnswers,
    List<string> CorrectAnswers,
    bool IsCorrect
);