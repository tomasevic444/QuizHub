public record QuizResultDto(
    int Score,
    int TotalPossibleScore,
    int CorrectCount,
    int TotalQuestions,
    List<QuestionResultDto> Results
);