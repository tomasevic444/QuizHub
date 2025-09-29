// QuizHub.Infrastructure/Services/LiveQuizService.cs

using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuizHub.Application.Services;
using QuizHub.Core.Entities;
using QuizHub.Infrastructure.Data;
using Microsoft.AspNetCore.SignalR; 


public class LiveQuizService : ILiveQuizService
{
    private readonly ConcurrentDictionary<string, LiveQuizRoom> _rooms = new();
    private readonly IServiceProvider _serviceProvider;
    private readonly ConcurrentDictionary<string, (Func<string, object, Task> ShowResult, Func<string, object, Task> FinishQuiz, Func<string, object, Task> SendNewQuestion)> _roomCallbacks = new();
    public LiveQuizService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public string? CreateRoom(int quizId)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var quizData = context.Quizzes
            .AsNoTracking()
            .Include(q => q.Questions)
                .ThenInclude(qu => qu.Options)
            .FirstOrDefault(q => q.Id == quizId);

        if (quizData != null)
        {
            quizData.Questions = quizData.Questions.ToList();
            foreach (var question in quizData.Questions)
            {
                question.Options = question.Options.ToList();
            }
        }

        if (quizData == null || !quizData.Questions.Any())
        {
            Console.WriteLine($"[SERVICE-LOG] CreateRoom FAILED for Quiz ID {quizId}: Quiz not found or has no questions.");
            return null;
        }

        var roomCode = GenerateRoomCode();
        var room = new LiveQuizRoom
        {
            RoomCode = roomCode,
            QuizId = quizId,
            QuizData = quizData
        };

        while (!_rooms.TryAdd(roomCode, room))
        {
            roomCode = GenerateRoomCode();
            room.RoomCode = roomCode;
        }

        Console.WriteLine($"[SERVICE-LOG] CreateRoom SUCCESS: Room {roomCode} created for Quiz ID {quizId} with {quizData.Questions.Count} questions.");
        return roomCode;
    }

    public LiveQuizRoom? GetRoom(string roomCode)
    {
        _rooms.TryGetValue(roomCode.ToUpper(), out var room);
        return room;
    }

    public LiveQuizRoom? GetRoomByConnectionId(string connectionId)
    {
        return _rooms.Values.FirstOrDefault(r => r.Players.ContainsKey(connectionId));
    }

    public void AddPlayerToRoom(string roomCode, LivePlayer player)
    {
        var room = GetRoom(roomCode);
        if (room != null)
        {
            room.Players.TryAdd(player.ConnectionId, player);
        }
    }

    public void RemovePlayerFromRoom(string connectionId)
    {
        var room = GetRoomByConnectionId(connectionId);
        if (room != null)
        {
            room.Players.TryRemove(connectionId, out _);
        }
    }

    public LiveQuestionDto? StartQuizAndGetFirstQuestion(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null || !room.QuizData.Questions.Any()) return null;

        room.CurrentQuestionIndex = 0;
        return GetQuestionDtoByIndex(room, 0);
    }

    public LiveQuestionDto? GetNextQuestion(string roomCode)
    {
        var room = GetRoom(roomCode);
        if (room == null) return null;

        if (room.CurrentQuestionIndex < room.QuizData.Questions.Count - 1)
        {
            room.CurrentQuestionIndex++;
            return GetQuestionDtoByIndex(room, room.CurrentQuestionIndex);
        }

        room.IsFinished = true;
        return null;
    }

    public int CalculateScore(string roomCode, string connectionId, List<int>? submittedOptionIds, string? textAnswer)
    {
        var room = GetRoom(roomCode);
        if (room == null || room.CurrentQuestionIndex < 0) return 0;

        if (!room.Players.TryGetValue(connectionId, out var player) || player.HasAnsweredCurrentQuestion)
        {
            return player?.Score ?? 0;
        }

        player.HasAnsweredCurrentQuestion = true;
        var question = room.QuizData.Questions.ElementAt(room.CurrentQuestionIndex);
        bool isCorrect = false;

        if (question.Type == QuestionType.FillInTheBlank)
        {
            var correctAnswer = question.Options.FirstOrDefault(o => o.IsCorrect)?.Text;
            if (correctAnswer != null && correctAnswer.Equals(textAnswer, StringComparison.OrdinalIgnoreCase))
            {
                isCorrect = true;
            }
        }
        else // SingleChoice, MultipleChoice, TrueFalse
        {
            var correctOptionIds = question.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToHashSet();
            isCorrect = correctOptionIds.SetEquals(submittedOptionIds ?? new List<int>());
        }

        if (isCorrect)
        {
            var timeTaken = (DateTime.UtcNow - room.QuestionStartTime).TotalSeconds;
            const int questionTimeLimit = 20;
            double speedFactor = Math.Max(0, (questionTimeLimit - timeTaken) / timeTaken);
            int speedBonus = (int)Math.Round(question.Points * 0.5 * speedFactor);
            int pointsAwarded = question.Points + speedBonus;
            player.Score += pointsAwarded;
        }

        return player.Score;
    }

    private LiveQuestionDto GetQuestionDtoByIndex(LiveQuizRoom room, int index)
    {
        var question = room.QuizData.Questions.ElementAt(index);
        room.QuestionStartTime = DateTime.UtcNow;

        return new LiveQuestionDto(
            index,
            question.Text,
            question.Type.ToString(),
            20, // 20 seconds per question
            question.Options.Select(o => new LiveOptionDto(o.Id, o.Text)).ToList()
        );
    }

    private string GenerateRoomCode()
    {
        return new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 4)
            .Select(s => s[new Random().Next(s.Length)]).ToArray());
    }
    private void ProceedToNextStep(object? state)
    {
        Console.WriteLine($"\n--- [TIMER-TICK] --- ProceedToNextStep called for room '{(string)state!}' at {DateTime.UtcNow} --- \n");

        _ = Task.Run(async () =>
        {
            try
            {
                var roomCode = (string)state!;
                var room = GetRoom(roomCode);

                if (room == null || room.IsFinished)
                {
                    room?.QuestionTimer?.Dispose();
                    _roomCallbacks.TryRemove(roomCode, out var _);
                    return;
                }

                room.QuestionTimer?.Change(Timeout.Infinite, Timeout.Infinite);

                var currentQuestion = room.QuizData.Questions.ElementAt(room.CurrentQuestionIndex);
                var correctOptionIds = currentQuestion.Options.Where(o => o.IsCorrect).Select(o => o.Id).ToList();
                var leaderboard = room.Players.Values
                    .OrderByDescending(p => p.Score)
                    .Select(p => new { p.Username, p.Score })
                    .ToList();

                Console.WriteLine($"[SERVICE-LOG] ProceedToNextStep: About to send results for question index {room.CurrentQuestionIndex}.");

                if (_roomCallbacks.TryGetValue(roomCode, out var callbacks))
                {
                    await callbacks.ShowResult(roomCode, new { CorrectOptionIds = correctOptionIds, Leaderboard = leaderboard });
                }

                Console.WriteLine("[SERVICE-LOG] ProceedToNextStep: Results sent. Waiting for 5 seconds...");
                await Task.Delay(5000);
                Console.WriteLine("[SERVICE-LOG] ProceedToNextStep: 5 seconds passed.");

                var currentRoom = GetRoom(roomCode);
                if (currentRoom == null) return;

                var nextQuestion = GetNextQuestion(roomCode);
                if (nextQuestion != null)
                {
                    Console.WriteLine($"[SERVICE-LOG] ProceedToNextStep: Preparing to send next question (index {currentRoom.CurrentQuestionIndex}).");
                    foreach (var player in currentRoom.Players.Values)
                    {
                        player.HasAnsweredCurrentQuestion = false;
                    }

                    if (_roomCallbacks.TryGetValue(roomCode, out var currentCallbacks))
                    {
                        await currentCallbacks.SendNewQuestion(roomCode, nextQuestion);
                    }

                    currentRoom.QuestionTimer?.Change(TimeSpan.FromSeconds(nextQuestion.TimeLimit), Timeout.InfiniteTimeSpan);
                    Console.WriteLine($"[SERVICE-LOG] ProceedToNextStep: Next question sent and timer restarted for {nextQuestion.TimeLimit}s.");
                }
                else
                {
                    Console.WriteLine("[SERVICE-LOG] ProceedToNextStep: No more questions. Finishing quiz.");
                    currentRoom.IsFinished = true;
                    if (_roomCallbacks.TryGetValue(roomCode, out var currentCallbacks))
                    {
                        await currentCallbacks.FinishQuiz(roomCode, leaderboard);
                    }

                    currentRoom.QuestionTimer?.Dispose();
                    _roomCallbacks.TryRemove(roomCode, out var _);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n!!!!!! [FATAL ERROR IN TIMER TASK] !!!!!!\nMESSAGE: {ex.Message}\nSTACK TRACE: {ex.StackTrace}\n");
            }
        });
    }
    public LiveQuestionDto? StartQuizAndGetFirstQuestion(
    string roomCode,
    Func<string, object, Task> sendToGroup,
    Func<string, object, Task> showResult,
    Func<string, object, Task> finishQuiz)
{
    var room = GetRoom(roomCode);

    if (room == null || room.QuizData == null) return null;
    if (!room.QuizData.Questions.Any() || room.CurrentQuestionIndex != -1) return null;

    room.CurrentQuestionIndex = 0;

    _roomCallbacks[roomCode] = (showResult, finishQuiz, sendToGroup);

    var questionDto = GetQuestionDtoByIndex(room, 0);

    Console.WriteLine($"[SERVICE-LOG] Starting timer for room '{roomCode}' with a {questionDto.TimeLimit}-second delay.");
    room.QuestionTimer = new Timer(ProceedToNextStep, roomCode, TimeSpan.FromSeconds(questionDto.TimeLimit), Timeout.InfiniteTimeSpan);

    return questionDto;
}
}