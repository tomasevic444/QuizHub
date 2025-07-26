// src/api/authService.ts
import axios from './axiosConfig'
import { type UserLogin, type UserRegister, type AuthResponse } from '../interfaces/auth.interfaces';

// Get the base URL from our environment variables
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/Auth`;

// Function to call the register endpoint
export const register = (data: UserRegister) => {
  return axios.post(`${API_URL}/register`, data);
};

// Function to call the login endpoint. 
export const login = (data: UserLogin) => {
  return axios.post<AuthResponse>(`${API_URL}/login`, data);
};