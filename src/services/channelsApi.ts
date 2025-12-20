import api from './api';
import type { Channel } from '../types';

export const channelsApi = {
  getAll: () => api.get<Channel[]>('channels'),
  getById: (id: number) => api.get<Channel>(`channels/${id}`),
  getByName: (name: string, userId: number) =>
    api.get<Channel>(`channels/name/${encodeURIComponent(name)}/user/${userId}`),
  create: (channel: Omit<Channel, 'id'>) => api.post('channels', channel),
  update: (id: number, data: Partial<Channel>) => api.put(`channels/${id}`, data),
  delete: (id: number) => api.delete(`channels/${id}`),
  subscribe: (channelId: number, userId: number) => 
    api.post(`channels/${channelId}/subscribe`, { userID: userId }),
  unsubscribe: (channelId: number, userId: number) =>
    api.post(`channels/${channelId}/unsubscribe`, { userID: userId }),
};
