// src/interfaces/user.interfaces.ts
export interface QuizAttemptHistory {
  attemptId: number;
  quizTitle: string;
  score: number;
  totalPossibleScore: number;
  percentage: number;
  attemptedAt: string; // ISO date string
}