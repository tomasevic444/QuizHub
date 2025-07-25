// src/interfaces/auth.interfaces.ts
export interface UserRegister {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  loginIdentifier: string; // username or email
  password: string;
}

// successful login
export interface AuthResponse {
  username: string;
  email: string;
  token: string;
}