import api from './api';

export interface Student {
  id?: number;
  userID: number;
  studentRegID: string;
  studentBranch: string;
  studentYear: number;
}

export const studentsApi = {
  getById: (id: number) => api.get<Student>(`students/${id}`),
  create: (data: Student) => api.post<Student>('students', data),
  update: (regId: string, data: Partial<Student>) =>
    api.put<Student>(`students/${regId}`, data),
  delete: (regId: string) => api.delete(`students/${regId}`),
};
