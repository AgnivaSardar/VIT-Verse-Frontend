export interface Video {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  channelName: string;
  channelId?: number;
  channelImage?: string;
  views: number;
  uploadedAt: string;
  badge?: string;
  url?: string;
  createdAt?: string;
}

export interface VideoStats {
  id?: number;
  vidID: number;
  views: number;
  likes: number;
}
