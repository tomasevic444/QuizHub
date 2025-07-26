// src/api/quizService.ts
import axios from './axiosConfig'
import type { Quiz, QuizTakerView } from '@/interfaces/quiz.interfaces';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/Quizzes`;

export interface QuizFilters {
  category?: string;
  difficulty?: string;
  searchTerm?: string;
}

export const getQuizzes = async (filters: QuizFilters): Promise<Quiz[]> => {
  try {
    // Use URLSearchParams to easily build the query string
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);

    const response = await axios.get<Quiz[]>(`${API_URL}?${params.toString()}`);
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    throw error;
  }
};

export const getCategories = async (): Promise<string[]> => {
    try {
        const response = await axios.get<string[]>(`${API_URL}/categories`);
        return response.data;
    } catch(error) {
        console.error("Failed to fetch categories:", error);
        throw error;
    }
}
export const getQuizForTaker = async (id: number): Promise<QuizTakerView> => {
    try {
        const response = await axios.get<QuizTakerView>(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch quiz ${id}:`, error);
        throw error;
    }
}