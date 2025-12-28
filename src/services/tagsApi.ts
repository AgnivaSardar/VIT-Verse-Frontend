import api from './api';

export interface Tag {
  id?: number;
  name: string;
  description?: string;
  color?: string;
}

export const tagsApi = {
  getById: (id: number) => api.get<Tag>(`tags/${id}`),
  getPopular: () => api.get<Tag[]>('tags/popular'),
  search: (query: string) => api.get<Tag[]>(`tags/search?q=${encodeURIComponent(query)}`),
  create: (data: Tag) => api.post<Tag>('tags', data),
  addToVideo: (videoId: number | string, tags: string[]) =>
    api.post(`tags/${videoId}/tags`, { tags }),
  getVideoTags: (videoId: number | string) => api.get<Tag[]>(`tags/${videoId}/tags`),
};
