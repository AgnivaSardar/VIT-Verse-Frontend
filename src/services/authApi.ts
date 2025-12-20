import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userID: number;
  name?: string;
  email?: string;
  role?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('auth/login', data),
  register: (data: RegisterRequest) =>
    api.post<User>('auth/register', data),
  getUser: (userId: number) =>
    api.get<User>(`users/${userId}`),
};
