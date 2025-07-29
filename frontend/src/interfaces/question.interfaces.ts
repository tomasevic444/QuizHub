// src/interfaces/question.interfaces.ts
export interface Option {
    id: number;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: number;
    text: string;
    type: 'SingleChoice' | 'MultipleChoice' | 'TrueFalse' | 'FillInTheBlank';
    points: number;
    quizId: number;
    options: Option[];
}