import api from './api';

export interface Playlist {
  id?: number;
  userID: number;
  name: string;
  description: string;
  isPublic: boolean;
  isPremium: boolean;
}

export const playlistsApi = {
  getById: (id: number) => api.get<Playlist>(`playlists/${id}`),
  create: (data: Playlist) => api.post<Playlist>('playlists', data),
  update: (id: number, data: Partial<Playlist>) =>
    api.put<Playlist>(`playlists/${id}`, data),
  delete: (id: number) => api.delete(`playlists/${id}`),
};
