public record QuizTakerQuestionDto(
    int Id,
    string Text,
    string Type,
    int Points,
    ICollection<QuizTakerOptionDto> Options
);