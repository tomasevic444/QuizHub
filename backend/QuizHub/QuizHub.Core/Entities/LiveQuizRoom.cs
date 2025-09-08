using QuizHub.Core.Entities;
using System.Collections.Concurrent;

public class LiveQuizRoom
{
    public string RoomCode { get; set; } = string.Empty;
    public int QuizId { get; set; }
    public Quiz QuizData { get; set; } = null!;   // The full quiz data with questions
    public ConcurrentDictionary<string, LivePlayer> Players { get; set; } = new();
    public int CurrentQuestionIndex { get; set; } = -1; // -1 means not started
    public DateTime QuestionStartTime { get; set; }
    public bool IsFinished { get; set; } = false;
}