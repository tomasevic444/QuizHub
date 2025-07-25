// QuizHub.Core/Entities/Question.cs
namespace QuizHub.Core.Entities;

public enum QuestionType
{
    SingleChoice,
    MultipleChoice,
    TrueFalse,
    FillInTheBlank
}

public class Question
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public QuestionType Type { get; set; }
    public int Points { get; set; } // Points for a correct answer

    public int QuizId { get; set; }
    public Quiz Quiz { get; set; } = null!;

    // For multiple choice, true/false questions
    public ICollection<Option> Options { get; set; } = new List<Option>();

   
}