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
  
  // Stats
  getStats: (id: number) => api.get<VideoStats>(`videostats/${id}`),
  incrementViews: (id: number) => api.post(`videostats/${id}/increment-views`, {}),
  incrementLikes: (id: number) => api.post(`videostats/${id}/increment-likes`, {}),
  decrementLikes: (id: number) => api.post(`videostats/${id}/decrement-likes`, {}),
  
  // Comments
  getComments: (videoId: number) => api.get(`comments/${videoId}`),
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
  unlike: () =>
    api.delete('likes'),
};
