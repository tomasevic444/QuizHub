// This is a complex file. Read the comments.
using Microsoft.EntityFrameworkCore;
using QuizHub.Application.DTOs;
using QuizHub.Application.Services;
using QuizHub.Core.Entities;
using QuizHub.Infrastructure.Data;

public class QuizService : IQuizService
{
    private readonly ApplicationDbContext _context;

    public QuizService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<QuizResultDto> SubmitQuizAsync(int quizId, int userId, QuizSubmissionDto submission)
    {
        // 1. Fetch the entire quiz with correct answers from the DB.
        var quiz = await _context.Quizzes
            .Include(q => q.Questions)
            .ThenInclude(q => q.Options)
            .FirstOrDefaultAsync(q => q.Id == quizId);

        if (quiz == null) throw new Exception("Quiz not found.");

        var questionResults = new List<QuestionResultDto>();
        var newAttempt = new QuizAttempt
        {
            QuizId = quizId,
            UserId = userId,
            TimeTakenInSeconds = submission.TimeTakenInSeconds,
            AttemptedAt = DateTime.UtcNow
        };

        int totalScore = 0;
        int correctCount = 0;

        // 2. Loop through each question in the quiz to score the submitted answers.
        foreach (var question in quiz.Questions)
        {
            var submittedAnswer = submission.Answers.FirstOrDefault(a => a.QuestionId == question.Id);
            var isAnswerCorrect = false;
            var userAnswersAsStrings = new List<string>();
            var correctAnswersAsStrings = question.Options.Where(o => o.IsCorrect).Select(o => o.Text).ToList();

            if (submittedAnswer != null)
            {
                switch (question.Type)
                {
                    case QuestionType.SingleChoice:
                    case QuestionType.TrueFalse:
                        var selectedOptionId = submittedAnswer.SelectedOptionIds?.FirstOrDefault();
                        isAnswerCorrect = question.Options.Any(o => o.Id == selectedOptionId && o.IsCorrect);
                        var selectedOption = question.Options.FirstOrDefault(o => o.Id == selectedOptionId);
                        if (selectedOption != null) userAnswersAsStrings.Add(selectedOption.Text);
                        break;

                    case QuestionType.MultipleChoice:
                        var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
                        var submittedOptionIds = submittedAnswer.SelectedOptionIds?.ToHashSet() ?? new HashSet<int>();
                        isAnswerCorrect = correctOptionIds.SetEquals(submittedOptionIds);
                        userAnswersAsStrings = question.Options.Where(o => submittedOptionIds.Contains(o.Id)).Select(o => o.Text).ToList();
                        break;

                    case QuestionType.FillInTheBlank:
                        var correctTexts = question.Options.Where(o => o.IsCorrect).Select(o => o.Text.ToLowerInvariant().Trim());
                        isAnswerCorrect = correctTexts.Contains(submittedAnswer.SubmittedText?.ToLowerInvariant().Trim() ?? "");
                        userAnswersAsStrings.Add(submittedAnswer.SubmittedText ?? "");
                        break;
                }
            }

            if (isAnswerCorrect)
            {
                totalScore += question.Points;
                correctCount++;
            }

            // Add to the detailed results list
            questionResults.Add(new QuestionResultDto(question.Text, userAnswersAsStrings, correctAnswersAsStrings, isAnswerCorrect));

            // Add to the entity for saving to DB
            newAttempt.UserAnswers.Add(new UserAnswer
            {
                QuestionId = question.Id,
                SelectedOptionIds = submittedAnswer?.SelectedOptionIds != null ? string.Join(",", submittedAnswer.SelectedOptionIds) : null,
                SubmittedText = submittedAnswer?.SubmittedText,
                IsCorrect = isAnswerCorrect
            });
        }

        // 3. Save the attempt to the database.
        newAttempt.Score = totalScore;
        _context.QuizAttempts.Add(newAttempt);
        await _context.SaveChangesAsync();

        // 4. Return the final, detailed result to the user.
        return new QuizResultDto(
            totalScore,
            quiz.Questions.Sum(q => q.Points),
            correctCount,
            quiz.Questions.Count,
            questionResults
        );
    }
}