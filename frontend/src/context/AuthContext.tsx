// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { login as apiLogin } from '../api/authService';
import { type UserLogin, type AuthResponse } from '../interfaces/auth.interfaces';

// 1. Define the shape of the context's value
interface AuthContextType {
  user: AuthResponse | null; // Holds user data if logged in, otherwise null
  login: (data: UserLogin) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // To handle initial page load
  token: string | null; // To easily access the token
}

// 2. Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs once when the app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      // If we find a token and user in localStorage, the user is already logged in
      setUser(JSON.parse(storedUser));
    }
    // We are done checking, so we can show the app
    setIsLoading(false); 
  }, [token]);

  // Login function
  const login = async (data: UserLogin) => {
    const response = await apiLogin(data); // Call our API service
    const userData = response.data;
    // Store user data and token in state and localStorage
    setUser(userData);
    setToken(userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Provide the state and functions to all child components
  const value = { user, login, logout, isLoading, token };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// 4. Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};