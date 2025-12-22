import api from './api';

export interface Playlist {
  id?: number;
  pID?: number;
  name: string;
  description: string;
  isPublic: boolean;
  isPremium: boolean;
}

export interface PlaylistVideo {
  pvID?: number;
  position?: number;
  vidID?: number;
  video?: {
    vidID: number;
    title: string;
    description?: string;
    thumbnail?: string;
    createdAt?: string;
  };
  createdAt?: string;
}

export interface PlaylistDetail extends Playlist {
  createdAt?: string;
  user?: {
    userName: string;
    userEmail: string;
  };
  videos?: PlaylistVideo[];
}

export const playlistsApi = {
  getAll: () => api.get<PlaylistDetail[]>('playlists'),
  getById: (id: number) => api.get<PlaylistDetail>(`playlists/${id}`),
  getMyPlaylists: () => api.get<Playlist[]>('playlists/my'),
  create: (data: Omit<Playlist, 'id' | 'pID'>) => api.post<Playlist>('playlists', data),
  update: (id: number, data: Partial<Playlist>) =>
    api.put<Playlist>(`playlists/${id}`, data),
  delete: (id: number) => api.delete(`playlists/${id}`),
  addVideo: (playlistId: number, videoId: number) =>
    api.post(`playlists/${playlistId}/videos`, { videoID: videoId }),
  removeVideo: (playlistId: number, playlistVideoId: number) =>
    api.delete(`playlists/${playlistId}/videos/${playlistVideoId}`),
};
