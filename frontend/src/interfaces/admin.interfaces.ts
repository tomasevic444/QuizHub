// src/interfaces/admin.interfaces.ts
export interface AdminQuizAttempt {
  attemptId: number;
  quizTitle: string;
  username: string;
  score: number;
  attemptedAt: string; 
}