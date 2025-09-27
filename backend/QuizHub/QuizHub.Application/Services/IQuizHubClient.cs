using QuizHub.Application.DTOs; // Pretpostavka da su DTO-ovi ovde
using System.Collections.Generic;
using System.Threading.Tasks;

// Definišite sve poruke koje server šalje klijentu
public interface IQuizHubClient
{
    Task UpdatePlayerList(object players);
    Task JoinedSuccess(string quizTitle);
    Task RoomCreated(string roomCode);
    Task Error(string message);
    Task ReceiveNewQuestion(object question); // Koristimo 'object' za fleksibilnost
    Task ShowQuestionResult(object result);
    Task QuizFinished(object finalLeaderboard);
    Task AnswerAcknowledged();
}