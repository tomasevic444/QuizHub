using QuizHub.Core.Entities;

public interface ILiveQuizService
{
    // Methods for managing rooms
    string? CreateRoom(int quizId);
    LiveQuizRoom? GetRoom(string roomCode);
    void AddPlayerToRoom(string roomCode, LivePlayer player);
    void RemovePlayerFromRoom(string connectionId);

    // Methods for game logic
    Question? GetNextQuestion(string roomCode);
    int CalculateScore(string roomCode, string connectionId); // Returns the score for the answer
    LiveQuizRoom? GetRoomByConnectionId(string connectionId);
}