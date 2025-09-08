// src/api/authService.ts
import axios from './axiosConfig';
import { type UserLogin, type UserRegister, type AuthResponse } from '@/interfaces/auth.interfaces';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/Auth`;

export const register = async (data: UserRegister): Promise<void> => {
  await axios.post(`${API_URL}/register`, data);
};

export const login = async (data: UserLogin): Promise<AuthResponse> => {
  const response = await axios.post<AuthResponse>(`${API_URL}/login`, data);
  return response.data;
};