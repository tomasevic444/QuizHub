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

export interface LiveQuestion {
    index: number;
    text: string;
    type: 'SingleChoice' | 'MultipleChoice' | 'TrueFalse'; 
    timeLimit: number;
    options: LiveOption[];
}

export interface QuestionResultPayload {
    correctOptionIds: number[];
    leaderboard: { username: string; score: number }[];
}