import api from './api';
import type { Video } from '../types/video';

export interface VideoStats {
  id?: number;
  vidID: number;
  views: number;
  likes: number;
}

export const videosApi = {
  getAll: () => api.get<Video[]>('videos'),
  getById: (id: number) => api.get<Video>(`videos/${id}`),
  upload: (formData: FormData) => api.upload('videos/upload', formData),
  // Related queries
  getByChannel: (channelId: number, limit: number = 10) =>
    api.get<Video[]>(`videos?channelID=${channelId}&limit=${limit}&status=public`),
  getByTag: (tagId: number, limit: number = 10) =>
    api.get<Video[]>(`videos?tagID=${tagId}&limit=${limit}&status=public`),
  searchByTitle: (query: string, limit: number = 10) =>
    api.get<Video[]>(`videos/search/title?q=${encodeURIComponent(query)}&limit=${limit}`),

  delete: (id: number) => api.delete(`videos/${id}`),
  update: (id: number, data: any) => {
    // If caller passes FormData (for thumbnail update), use upload route with PATCH
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return api.upload(`videos/${id}`, data, 'PATCH');
    }
    return api.patch(`videos/${id}`, data);
  },
  
  // Stats
  getStats: (id: number) => api.get<VideoStats>(`videostats/${id}`),
  incrementViews: (id: number) => api.post(`videostats/${id}/increment-views`, {}),
  incrementLikes: (id: number) => api.post(`videostats/${id}/increment-likes`, {}),
  decrementLikes: (id: number) => api.post(`videostats/${id}/decrement-likes`, {}),
  
  // Comments
  getComments: (videoId: number) =>
    api.get(`comments/video/${videoId}`).catch((err: any) => {
      const msg = typeof err?.message === 'string' ? err.message : '';
      // Gracefully handle missing comments with empty list
      if (msg.includes('HTTP Error: 404')) {
        return { data: [] } as any;
      }
      throw err;
    }),
  addComment: (data: { userID: number; vidID: number; description: string }) =>
    api.post('comments', data),
  updateComment: (id: number, data: { description: string }) =>
    api.put(`comments/${id}`, data),
  deleteComment: (id: number) => api.delete(`comments/${id}`),
  
  // Likes
  getLikesCount: (videoId: number) => api.get(`likes/count/${videoId}`),
  hasLiked: (userId: number, videoId: number) =>
    api.get(`likes/hasLiked/user/${userId}/video/${videoId}`),
  like: (userId: number, videoId: number) =>
    api.post('likes', { userID: userId, vidID: videoId }),
  unlike: (userId: number, videoId: number) =>
    api.deleteWithBody('likes', { userID: userId, vidID: videoId }),
};
