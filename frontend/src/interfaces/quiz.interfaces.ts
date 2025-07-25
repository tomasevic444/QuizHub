// src/interfaces/quiz.interfaces.ts
export interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  categoryName: string;
}