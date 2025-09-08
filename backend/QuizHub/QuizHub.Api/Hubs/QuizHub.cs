// QuizHub.Api/Hubs/QuizHub.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using QuizHub.Application.Services;

using System.Security.Claims;

namespace QuizHub.Api.Hubs;

[Authorize]
public class QuizHub : Hub
{
    private readonly ILiveQuizService _liveQuizService;

    public QuizHub(ILiveQuizService liveQuizService)
    {
        _liveQuizService = liveQuizService;
    }

    public override async Task OnConnectedAsync()
    {
        // Useful for debugging to see connections in the backend console
        Console.WriteLine($"--> Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    public async Task JoinRoom(string roomCode)
    {
        var room = _liveQuizService.GetRoom(roomCode);
        if (room == null)
        {
            await Clients.Caller.SendAsync("Error", "Room not found.");
            return;
        }
        if (room.CurrentQuestionIndex > -1)
        {
            await Clients.Caller.SendAsync("Error", "Quiz has already started.");
            return;
        }

        // --- FINAL ROBUST USER IDENTIFICATION ---
        // Try to get username from the standard Identity.Name first.
        // If it's null, fall back to finding the "name" claim directly from the token.
        var username = Context.User?.Identity?.Name ?? Context.User?.FindFirst("name")?.Value;

        // Get the User ID from the NameIdentifier claim (which corresponds to "sub" in the JWT)
        var userIdClaim = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(username) || !int.TryParse(userIdClaim, out var userId))
        {
            await Clients.Caller.SendAsync("Error", "Could not identify user from the provided token.");
            return;
        }
        // ------------------------------------------

        var player = new LivePlayer
        {
            ConnectionId = Context.ConnectionId,
            UserId = userId,
            Username = username,
            Score = 0
        };

        _liveQuizService.AddPlayerToRoom(roomCode, player);
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        // Notify everyone in the room (including the new player) about the updated player list
        await Clients.Group(roomCode).SendAsync("UpdatePlayerList", room.Players.Values.ToList());
        await Clients.Caller.SendAsync("JoinedSuccess", room.QuizData.Title);
    }

    public async Task AdminCreateRoom(int quizId)
    {
        // A simpler, more direct way to check the role.
        if (Context.User?.IsInRole("Admin") != true)
        {
            await Clients.Caller.SendAsync("Error", "Only admins can create rooms.");
            return;
        }

        var roomCode = _liveQuizService.CreateRoom(quizId);
        if (roomCode == null)
        {
            await Clients.Caller.SendAsync("Error", "Quiz not found or has no questions.");
            return;
        }

        // Add the admin's connection to the group so they can monitor the lobby
        await Groups.AddToGroupAsync(Context.ConnectionId, roomCode);

        // Send the room code back to the admin client
        await Clients.Caller.SendAsync("RoomCreated", roomCode);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;

        // Find the room the disconnected player was in
        var room = _liveQuizService.GetRoomByConnectionId(connectionId);

        // Remove the player from the in-memory state
        _liveQuizService.RemovePlayerFromRoom(connectionId);

        if (room != null)
        {
            // Notify the remaining players in that room that someone has left
            await Clients.Group(room.RoomCode).SendAsync("UpdatePlayerList", room.Players.Values.ToList());
        }

        Console.WriteLine($"--> Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }
}