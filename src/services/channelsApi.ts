import api from './api';
import type { Channel } from '../types';

export const channelsApi = {
  getAll: () => api.get<Channel[]>('channels'),
  getById: (id: number) => api.get<Channel>(`channels/${id}`),
  getByName: (name: string, userId: number) =>
    api.get<Channel>(`channels/name/${encodeURIComponent(name)}/user/${userId}`),
  getMyChannel: () => api.get<Channel>('channels/my'),
  getStats: (id: number) => api.get(`channels/${id}/stats`),
  create: (payload: Omit<Channel, 'id'> | FormData) => {
    if (payload instanceof FormData) return api.upload('channels', payload);
    return api.post('channels', payload);
  },
  update: (id: number, data: Partial<Channel> | FormData) => {
    if (data instanceof FormData) return api.upload(`channels/${id}`, data, 'PUT');
    return api.put(`channels/${id}`, data);
  },
  delete: (id: number) => api.delete(`channels/${id}`),
  subscribe: (channelId: number, userId: number) => 
    api.post(`channels/${channelId}/subscribe`, { userID: userId }),
  unsubscribe: (channelId: number, userId: number) =>
    api.post(`channels/${channelId}/unsubscribe`, { userID: userId }),
};
