import api from './api';

export interface Notification {
  id?: number;
  notifID?: number;
  userID: number;
  entityID?: number | null;
  type: string;
  message: string;
  isRead?: boolean;
  priority?: string;
  category?: string;
  metadata?: any;
  createdBy?: number | null;
  createdAt?: string;
}

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('notifications'),
  getById: (id: number) => api.get<Notification>(`notifications/${id}`),
  getUserNotifications: (userId: number) =>
    api.get<Notification[]>(`notifications/user/${userId}`),
  getUnreadCount: (userId: number) =>
    api.get<{ unreadCount: number }>(`notifications/user/${userId}/unread-count`),
  markAllAsRead: (userId: number) =>
    api.post(`notifications/user/${userId}/mark-all-read`, {}),
  create: (data: Notification) => api.post<Notification>('notifications', data),
  markAsRead: (id: number) =>
    api.post(`notifications/${id}/mark-as-read`, {}),
  update: (id: number, data: Partial<Notification>) =>
    api.put<Notification>(`notifications/${id}`, data),
  delete: (id: number) => api.delete(`notifications/${id}`),
  deleteUserNotifications: (userId: number) =>
    api.delete(`notifications/user/${userId}`),
  sendAdminNotification: (recipientUserID: number, message: string, priority?: string) =>
    api.post('notifications/admin/send', { recipientUserID, message, priority }),
};
