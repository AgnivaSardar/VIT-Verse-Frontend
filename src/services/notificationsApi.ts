import api from './api';

export interface Notification {
  id?: number;
  userID: number;
  entityID: number;
  type: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('notifications'),
  getById: (id: number) => api.get<Notification>(`notifications/${id}`),
  getUserNotifications: (userId: number) =>
    api.get<Notification[]>(`notifications/user/${userId}`),
  create: (data: Notification) => api.post<Notification>('notifications', data),
  markAsRead: (id: number) =>
    api.post(`notifications/${id}/mark-as-read`, {}),
  update: (id: number, data: Partial<Notification>) =>
    api.put<Notification>(`notifications/${id}`, data),
  delete: (id: number) => api.delete(`notifications/${id}`),
  deleteUserNotifications: (userId: number) =>
    api.delete(`notifications/user/${userId}`),
};
