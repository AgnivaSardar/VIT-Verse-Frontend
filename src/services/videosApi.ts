
import api, { uploadWithProgress } from './api';
import type { Video } from '../types/video';

// Poll backend for processing progress
export const pollProcessingProgress = async (uploadId: string): Promise<{ percent: number; status: string;[key: string]: any }> => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = { 'x-bypass-rate-limit': '1' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  const url = `${API_BASE}/videos/progress/${uploadId}`;
  const res = await fetch(url, { headers, credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch progress');
  return await res.json();
};

export interface VideoStats {
  id?: number;
  vidID: number;
  views: number;
  likes: number;
}

export const videosApi = {
  getAll: () => api.get<Video[]>('videos'),
  getById: (id: number | string) => api.get<Video>(`videos/${id}`),
  upload: (formData: FormData) => api.upload('videos/upload', formData),
  uploadWithProgress: (formData: FormData, onProgress: (percent: number) => void) =>
    uploadWithProgress('videos/upload', formData, onProgress),
  // Related queries
  getByChannel: (channelId: number | string, limit: number = 10) =>
    api.get<Video[]>(`videos?channelID=${channelId}&limit=${limit}&status=public`),
  getByTag: (tagId: number | string, limit: number = 10) =>
    api.get<Video[]>(`videos?tagID=${tagId}&limit=${limit}&status=public`),
  searchByTitle: (query: string, limit: number = 10) =>
    api.get<Video[]>(`videos/search/title?q=${encodeURIComponent(query)}&limit=${limit}`),

  delete: (id: number | string) => api.delete(`videos/${id}`),
  update: (id: number | string, data: any) => {
    // If caller passes FormData (for thumbnail update), use upload route with PATCH
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return api.upload(`videos/${id}`, data, 'PATCH');
    }
    return api.patch(`videos/${id}`, data);
  },

  // Stats
  getStats: (id: number | string) => api.get<VideoStats>(`videostats/${id}`),
  incrementViews: (id: number | string) => api.post(`videostats/${id}/increment-views`, {}),
  incrementLikes: (id: number | string) => api.post(`videostats/${id}/increment-likes`, {}),
  decrementLikes: (id: number | string) => api.post(`videostats/${id}/decrement-likes`, {}),

  // Comments
  getComments: (videoId: number | string) =>
    api.get(`comments/video/${videoId}`).catch((err: any) => {
      const msg = typeof err?.message === 'string' ? err.message : '';
      // Gracefully handle missing comments with empty list
      if (msg.includes('HTTP Error: 404')) {
        return { data: [] } as any;
      }
      throw err;
    }),
  addComment: (data: { userID: number | string; vidID: number | string; description: string }) =>
    api.post('comments', data),
  updateComment: (id: number, data: { description: string }) =>
    api.put(`comments/${id}`, data),
  deleteComment: (id: number) => api.delete(`comments/${id}`),

  // Likes
  getLikesCount: (videoId: number | string) => api.get(`likes/count/${videoId}`),
  hasLiked: (userId: number | string, videoId: number | string) =>
    api.get(`likes/hasLiked/user/${userId}/video/${videoId}`),
  like: (userId: number | string, videoId: number | string) =>
    api.post('likes', { userID: userId, vidID: videoId }),
  unlike: (userId: number | string, videoId: number | string) =>
    api.deleteWithBody('likes', { userID: userId, vidID: videoId }),
};

