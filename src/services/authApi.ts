import api from './api';

export interface LoginRequest {
  identifier: string; // email, registration number, or employee ID
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
  studentRegID?: string;
  employeeID?: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

export interface RequestPasswordChangeRequest {
  email: string;
}

export interface ChangePasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('auth/login', data),
  register: (data: RegisterRequest) =>
    api.post<User>('auth/register', data),
  getUser: (userId: number) =>
    api.get<User>(`users/${userId}`),
  requestPasswordChange: (data: RequestPasswordChangeRequest) =>
    api.post('auth/request-password-change', data),
  changePassword: (data: ChangePasswordRequest) =>
    api.post('auth/change-password', data),
};
