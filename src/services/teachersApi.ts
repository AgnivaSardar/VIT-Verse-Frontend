import api from './api';

export interface Teacher {
  id?: number;
  userID: number;
  teacherID: string;
  teacherSchool: string;
}

export const teachersApi = {
  getAll: () => api.get<Teacher[]>('teachers'),
  getById: (id: string) => api.get<Teacher>(`teachers/${id}`),
  create: (data: Teacher) => api.post<Teacher>('teachers', data),
  update: (id: string, data: Partial<Teacher>) =>
    api.put<Teacher>(`teachers/${id}`, data),
  delete: (id: string) => api.delete(`teachers/${id}`),
};
