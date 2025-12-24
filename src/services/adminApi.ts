import api from './api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'teacher';
  isActive: boolean;
  isEmailVerified: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
}

export interface AdminChannel {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  videosCount: number;
  subscribersCount: number;
  isAvailableToPublic: boolean;
  createdAt: string;
}

export interface AdminVideo {
  id: string;
  title: string;
  channelName: string;
  views: number;
  duration: number;
  visibility: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalChannels: number;
  totalVideos: number;
  totalPlaylists: number;
  activeUsers: number;
  totalViews: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminApi = {
  // Dashboard Stats
  getStats: () => api.get<DashboardStats>('/admin/stats'),

  // Users Management
  getAllUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    const query = queryParams.toString();
    return api.get<PaginatedResponse<AdminUser>>(`/admin/users${query ? `?${query}` : ''}`);
  },

  createUser: (data: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'student' | 'teacher';
    isSuperAdmin?: boolean;
  }) => api.post<AdminUser>('/admin/users/create', data),

  toggleUserStatus: (userId: string) =>
    api.patch(`/admin/users/${userId}/toggle-status`),

  // Channels Management
  getAllChannels: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return api.get<PaginatedResponse<AdminChannel>>(`/admin/channels${query ? `?${query}` : ''}`);
  },

  toggleChannelVisibility: (channelId: string) =>
    api.patch(`/admin/channels/${channelId}/toggle-visibility`),

  // Videos Management
  getAllVideos: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return api.get<PaginatedResponse<AdminVideo>>(`/admin/videos${query ? `?${query}` : ''}`);
  },

  toggleVideoVisibility: (videoId: string) =>
    api.patch(`/admin/videos/${videoId}/toggle-visibility`),
};
