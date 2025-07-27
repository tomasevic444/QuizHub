// QuizHub.Application/DTOs/LeaderboardEntryDto.cs
public record LeaderboardEntryDto(
    int Rank,
    string Username,
    int Score,
    double Percentage, 
    int TimeTakenInSeconds,
    DateTime AttemptedAt
);