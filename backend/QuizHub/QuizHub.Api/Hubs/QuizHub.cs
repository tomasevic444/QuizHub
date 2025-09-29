// QuizHub.Api/Hubs/QuizHub.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using QuizHub.Application.Services;
using System.Security.Claims;

namespace QuizHub.Api.Hubs;

[Authorize]
public class QuizHub : Hub<IQuizHubClient>
{
    private readonly ILiveQuizService _liveQuizService;

    public QuizHub(ILiveQuizService liveQuizService)
    {
        _liveQuizService = liveQuizService;
    }

    public class PlayerAnswerDto
    {
        public List<int>? OptionIds { get; set; }
        public string? TextAnswer { get; set; }
    }

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"--> Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;
        var room = _liveQuizService.GetRoomByConnectionId(connectionId);
        _liveQuizService.RemovePlayerFromRoom(connectionId);

        if (room != null)
        {
            await Clients.Group(room.RoomCode).UpdatePlayerList(room.Players.Values.ToList());
        }

        Console.WriteLine($"--> Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinRoom(string roomCode)
    {
        var room = _liveQuizService.GetRoom(roomCode);
        if (room == null)
        {
            await Clients.Caller.Error("Room not found.");
            return;
        }
        if (room.CurrentQuestionIndex > -1)
        {
            await Clients.Caller.Error("Quiz has already started.");
            return;
        }

        var username = Context.User?.Identity?.Name ?? Context.User?.FindFirst("name")?.Value;
        var userIdClaim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(username) || !int.TryParse(userIdClaim, out var userId))
        {
            await Clients.Caller.Error("Could not identify user from the provided token.");
            return;
        }

        var player = new LivePlayer
        {
            ConnectionId = Context.ConnectionId,
            UserId = userId,
            Username = username,
            Score = 0
        };

        _liveQuizService.AddPlayerToRoom(roomCode, player);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        await Clients.Group(roomCode).UpdatePlayerList(room.Players.Values.ToList());
        await Clients.Caller.JoinedSuccess(room.QuizData.Title);
    }

    public async Task AdminCreateRoom(int quizId)
    {
        if (Context.User?.IsInRole("Admin") != true)
        {
            await Clients.Caller.Error("Only admins can create rooms.");
            return;
        }

        var roomCode = _liveQuizService.CreateRoom(quizId);
        if (roomCode == null)
        {
            await Clients.Caller.Error("Quiz not found or has no questions.");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        await Clients.Caller.RoomCreated(roomCode);
    }

    public async Task AdminStartQuiz(string roomCode)
    {
        if (Context.User?.IsInRole("Admin") != true) return;

        var room = _liveQuizService.GetRoom(roomCode);
        if (room == null)
        {
            await Clients.Caller.Error("Room not found or has expired.");
            return;
        }

        if (room.CurrentQuestionIndex != -1)
        {
            Console.WriteLine($"[HUB-LOG] AdminStartQuiz for room {roomCode} was ignored because the quiz is already in progress (CurrentQuestionIndex: {room.CurrentQuestionIndex}).");
            return;
        }

        Func<string, object, Task> sendNewQuestionCallback = async (code, question) =>
        {
            await Clients.Group(code).ReceiveNewQuestion(question);
        };

        Func<string, object, Task> showResultCallback = async (code, result) =>
        {
            await Clients.Group(code).ShowQuestionResult(result);
        };

        Func<string, object, Task> finishQuizCallback = async (code, leaderboard) =>
        {
            await Clients.Group(code).QuizFinished(leaderboard);
        };

        var firstQuestion = _liveQuizService.StartQuizAndGetFirstQuestion(
            roomCode,
            sendNewQuestionCallback,
            showResultCallback,
            finishQuizCallback
        );

        if (firstQuestion != null)
        {
            await Clients.Group(roomCode).ReceiveNewQuestion(firstQuestion);
        }
        else
        {
            await Clients.Group(roomCode).Error("Could not start the quiz. The quiz may not have any questions.");
        }
    }

    public async Task PlayerSubmitAnswer(string roomCode, PlayerAnswerDto answer)
    {
        var connectionId = Context.ConnectionId;

        _liveQuizService.CalculateScore(roomCode, connectionId, answer.OptionIds, answer.TextAnswer);

        await Clients.Caller.AnswerAcknowledged();
    }
}