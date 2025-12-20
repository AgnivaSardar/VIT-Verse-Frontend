import api from './api';

export interface Report {
  id?: number;
  reporterID: number;
  vidID: number;
  reason: string;
  status?: string;
}

export const reportsApi = {
  getById: (id: number) => api.get<Report>(`reports/${id}`),
  create: (data: Report) => api.post<Report>('reports', data),
  update: (id: number, data: Partial<Report>) =>
    api.put<Report>(`reports/${id}`, data),
  delete: (id: number) => api.delete(`reports/${id}`),
};
