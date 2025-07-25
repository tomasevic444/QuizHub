public record QuizTakerViewDto(
    int Id,
    string Title,
    int TimeLimitInSeconds,
    ICollection<QuizTakerQuestionDto> Questions
);