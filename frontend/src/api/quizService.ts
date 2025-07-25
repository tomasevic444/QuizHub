// src/api/quizService.ts
import axios from 'axios';
import type { Quiz } from '@/interfaces/quiz.interfaces';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/Quizzes`;

export const getQuizzes = async (): Promise<Quiz[]> => {
  const response = await axios.get<Quiz[]>(API_URL);
  return response.data;
};