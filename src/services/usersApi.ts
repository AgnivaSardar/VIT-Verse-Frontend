import api from './api';

export interface User {
  id?: number;
  username: string;
  userEmail: string;
  userPassword?: string;
  role: 'student' | 'teacher';
  userPhone?: string;
  isActive?: boolean;
}

export const usersApi = {
  getAll: () => api.get<User[]>('users'),
  getById: (id: number) => api.get<User>(`users/${id}`),
  create: (data: User) => api.post<User>('users', data),
  update: (id: number, data: Partial<User>) => api.put<User>(`users/${id}`, data),
  activate: (id: number) => api.post(`users/${id}/activate`, {}),
  deactivate: (id: number) => api.post(`users/${id}/deactivate`, {}),
  delete: (id: number) => api.delete(`users/${id}`),
};
