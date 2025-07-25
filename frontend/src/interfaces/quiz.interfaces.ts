// src/interfaces/quiz.interfaces.ts
export interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  numberOfQuestions: number; 
  categoryName: string;
}
export interface QuizTakerOption {
  id: number;
  text: string;
}

export interface QuizTakerQuestion {
  id: number;
  text: string;
  type: 'SingleChoice' | 'MultipleChoice' | 'TrueFalse' | 'FillInTheBlank';
  points: number;
  options: QuizTakerOption[];
}

export interface QuizTakerView {
  id: number;
  title: string;
  timeLimitInSeconds: number;
  questions: QuizTakerQuestion[];
}