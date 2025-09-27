using QuizHub.Core.Entities;

public record LiveOptionDto(int Id, string Text);
public record LiveQuestionDto(int Index, string Text, string Type, int TimeLimit, List<LiveOptionDto> Options);

public interface ILiveQuizService
{
    // Room management
    string? CreateRoom(int quizId);
    LiveQuizRoom? GetRoom(string roomCode);
    LiveQuizRoom? GetRoomByConnectionId(string connectionId);
    void AddPlayerToRoom(string roomCode, LivePlayer player);
    void RemovePlayerFromRoom(string connectionId);

    // Game logic
    LiveQuestionDto? StartQuizAndGetFirstQuestion(
        string roomCode,
        Func<string, object, Task> sendToGroup,
        Func<string, object, Task> showResult,
        Func<string, object, Task> finishQuiz
    );
    LiveQuestionDto? GetNextQuestion(string roomCode);

    // The signature must include the player's submitted answer IDs
    int CalculateScore(string roomCode, string connectionId, List<int> optionIds);
}