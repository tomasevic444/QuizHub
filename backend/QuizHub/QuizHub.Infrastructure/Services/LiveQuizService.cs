// QuizHub.Infrastructure/Services/LiveQuizService.cs

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using QuizHub.Application.Services;
using QuizHub.Core.Entities;
using QuizHub.Infrastructure.Data;
using System.Collections.Concurrent;

public class LiveQuizService : ILiveQuizService
{
    private readonly ConcurrentDictionary<string, LiveQuizRoom> _rooms = new();
    private readonly IServiceProvider _serviceProvider;

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
            .Include(q => q.Questions).ThenInclude(qu => qu.Options)
            .FirstOrDefault(q => q.Id == quizId);

        if (quizData == null) return null;

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

    public Question? GetNextQuestion(string roomCode) => throw new NotImplementedException();
    public int CalculateScore(string roomCode, string connectionId) => throw new NotImplementedException();

    private string GenerateRoomCode()
    {
        return new string(Enumerable.Repeat("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 4)
            .Select(s => s[new Random().Next(s.Length)]).ToArray());
    }
}