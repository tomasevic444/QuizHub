// src/api/adminService.ts
import axios from './axiosConfig';
import type { Quiz } from '@/interfaces/quiz.interfaces';

export interface AdminQuizUpsert {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimitInSeconds: number;
  categoryId: number;
}

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/Admin`;

// Use async/await for all functions
export const getQuizzesForAdmin = async (): Promise<Quiz[]> => {
  const response = await axios.get<Quiz[]>(`${API_URL}/quizzes`);
  return response.data;
};

export const createQuiz = async (quiz: AdminQuizUpsert): Promise<Quiz> => {
  const response = await axios.post<Quiz>(`${API_URL}/quizzes`, quiz);
  return response.data;
};

export const updateQuiz = async (id: number, quiz: AdminQuizUpsert): Promise<void> => {
  await axios.put(`${API_URL}/quizzes/${id}`, quiz);
};

export const deleteQuiz = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/quizzes/${id}`);
};