public interface IQuizService
{
    Task<QuizResultDto> SubmitQuizAsync(int quizId, int userId, QuizSubmissionDto submission);
}