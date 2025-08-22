// src/api/userService.ts
import axios from './axiosConfig';
import type { QuizAttemptHistory } from '@/interfaces/user.interfaces';
import type { QuizResult } from '@/interfaces/quiz.interfaces';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/Users`;

export const getMyResults = async (): Promise<QuizAttemptHistory[]> => {
    const response = await axios.get<QuizAttemptHistory[]>(`${API_URL}/me/results`);
    return response.data;
}

export const getMyResultDetails = async (attemptId: number): Promise<QuizResult> => {
    const response = await axios.get<QuizResult>(`${API_URL}/me/results/${attemptId}`);
    return response.data;
}