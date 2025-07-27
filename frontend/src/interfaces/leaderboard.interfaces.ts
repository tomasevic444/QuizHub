// src/interfaces/leaderboard.interfaces.ts
export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  percentage: number; 
  timeTakenInSeconds: number;
  attemptedAt: string;
}