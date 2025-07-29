// src/interfaces/quiz.interfaces.ts


export interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  numberOfQuestions: number; 
  categoryName: string;
  categoryId: number; 
  timeLimitInSeconds: number;
}

export interface Category {
  id: number;
  name: string;
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

export interface QuestionResult {
  questionText: string;
  userAnswers: string[];
  correctAnswers: string[];
  isCorrect: boolean;
}

export interface QuizResult {
  score: number;
  totalPossibleScore: number;
  correctCount: number;
  totalQuestions: number;
  results: QuestionResult[];
}

export interface AnswerSubmission {
  questionId: number;
  selectedOptionIds?: number[];
  submittedText?: string;
}

export interface QuizSubmission {
  timeTakenInSeconds: number;
  answers: AnswerSubmission[];
}