// QuizHub.Api/Hubs/QuizHub.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace QuizHub.Api.Hubs;

public class QuizHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
        Console.WriteLine($"--> Client connected: {Context.ConnectionId}");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"--> Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }

    public async Task JoinRoom(string roomCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);
        await Clients.Caller.SendAsync("JoinedRoom", $"You have successfully joined room {roomCode}.");
        await Clients.Group(roomCode).SendAsync("PlayerJoined", $"A new player has joined the room.");
    }

    public async Task StartQuiz(string roomCode)
    {
        await Clients.Group(roomCode).SendAsync("QuizStarted", "The quiz is about to begin!");
    }

    public async Task SubmitAnswer(string roomCode, int questionId, int optionId)
    {
        var username = Context.User?.Identity?.Name ?? "Anonymous";
        await Clients.Group(roomCode).SendAsync("AnswerReceived", $"{username} has submitted an answer.");
    }
}