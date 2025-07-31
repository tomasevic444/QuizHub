// src/api/adminService.ts
import axios from './axiosConfig';
import type { Quiz } from '@/interfaces/quiz.interfaces';
import type { Question } from '@/interfaces/question.interfaces';
import type { AdminQuizAttempt } from '@/interfaces/admin.interfaces';

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

export interface AdminOptionUpsert { text: string; isCorrect: boolean; }
export interface AdminQuestionUpsert {
    text: string;
    type: Question['type'];
    points: number;
    options: AdminOptionUpsert[];
}

// --- Question Functions ---
export const getQuestionsForQuiz = async (quizId: number): Promise<Question[]> => {
    const response = await axios.get<Question[]>(`${API_URL}/quizzes/${quizId}/questions`);
    return response.data;
};

export const createQuestion = async (quizId: number, question: AdminQuestionUpsert): Promise<Question> => {
    const response = await axios.post<Question>(`${API_URL}/quizzes/${quizId}/questions`, question);
    return response.data;
};

export const updateQuestion = async (questionId: number, question: AdminQuestionUpsert): Promise<void> => {
    await axios.put(`${API_URL}/questions/${questionId}`, question);
};

export const deleteQuestion = async (questionId: number): Promise<void> => {
    await axios.delete(`${API_URL}/questions/${questionId}`);
};

// --- Category Functions ---
export const createCategory = async (name: string): Promise<void> => {
    await axios.post(`${API_URL}/categories`, `"${name}"`, {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const updateCategory = async (id: number, name: string): Promise<void> => {
    await axios.put(`${API_URL}/categories/${id}`, `"${name}"`, {
        headers: { 'Content-Type': 'application/json' }
    });
};

export const deleteCategory = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/categories/${id}`);
};

// --- User Results Function ---
export const getAllResults = async (): Promise<AdminQuizAttempt[]> => {
    const response = await axios.get<AdminQuizAttempt[]>(`${API_URL}/results`);
    return response.data;
}