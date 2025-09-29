// src/interfaces/livequiz.interfaces.ts

export interface LivePlayer {
    userId: number;
    username: string;
    connectionId: string; 
    score: number;
}

export interface LiveOption {
    id: number;
    text: string;
}
export type QuestionType = 'SingleChoice' | 'MultipleChoice' | 'TrueFalse' | 'FillInTheBlank';
export interface LiveQuestion {
    index: number;
    text: string;
    type: QuestionType;
    timeLimit: number;
    options: LiveOption[];
}

export interface QuestionResultPayload {
    correctOptionIds: number[];
    leaderboard: { username: string; score: number }[];
}