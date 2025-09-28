// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { login as apiLogin } from '../api/authService';
import { type UserLogin } from '../interfaces/auth.interfaces';

interface UserData {
    username: string;
    role: string;
}

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  login: (data: UserLogin) => Promise<UserData>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (data: UserLogin): Promise<UserData> => {
  const authResponse = await apiLogin(data);
  const newToken = authResponse.token;
  const decodedToken: any = jwtDecode(newToken);

  const userData: UserData = {
    username: decodedToken.name,
    role: decodedToken.role ?? decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
  };

  localStorage.setItem('token', newToken);
  localStorage.setItem('user', JSON.stringify(userData));

  setToken(newToken);
  setUser(userData);

  return userData; 
};
  
  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = { user, token, login, logout, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};