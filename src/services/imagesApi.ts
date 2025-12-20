import api from './api';

export interface Image {
  id?: number;
  vidID: number;
  s3Bucket: string;
  s3Key: string;
  imgURL: string;
  isPrimary: boolean;
}

export const imagesApi = {
  getById: (id: number) => api.get<Image>(`images/${id}`),
  create: (data: Image) => api.post<Image>('images', data),
  update: (id: number, data: Partial<Image>) =>
    api.put<Image>(`images/${id}`, data),
  delete: (id: number) => api.delete(`images/${id}`),
};
