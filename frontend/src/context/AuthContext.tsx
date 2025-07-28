// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { login as apiLogin } from '../api/authService';
import { type UserLogin } from '../interfaces/auth.interfaces';
import { jwtDecode } from 'jwt-decode';


interface UserData {
    username: string;
    role: string;
}

// 1. Define the shape of the context's value
interface AuthContextType {
  user: UserData | null; // Holds user data if logged in, otherwise null
  login: (data: UserLogin) => Promise<void>;
  logout: () => void;
  isLoading: boolean; // To handle initial page load
  token: string | null; // To easily access the token
}

// 2. Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create the Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        const decodedToken: any = jwtDecode(storedToken);
        setUser({ username: decodedToken.name, role: decodedToken.role });
    }
    setIsLoading(false);
}, []);

const login = async (data: UserLogin) => {
    const response = await apiLogin(data);
    const token = response.data.token;
    const decodedToken: any = jwtDecode(token);
    const userData = { username: decodedToken.name, role: decodedToken.role };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData)); // Store decoded data
    setUser(userData);
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