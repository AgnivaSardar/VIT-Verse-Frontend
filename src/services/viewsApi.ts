import api from './api';

export interface VideoView {
  id?: number;
  userID: number;
  vidID: number;
  watchTime: number;
  ipAddress: string;
  userAgent: string;
}

export const viewsApi = {
  getAll: () => api.get<VideoView[]>('views'),
  getById: (id: number) => api.get<VideoView>(`views/${id}`),
  create: (data: VideoView) => api.post<VideoView>('views', data),
  update: (id: number, data: Partial<VideoView>) =>
    api.put<VideoView>(`views/${id}`, data),
  delete: (id: number) => api.delete(`views/${id}`),
};
