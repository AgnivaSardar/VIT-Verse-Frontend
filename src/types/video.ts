export interface Video {
  id: number;
  publicID?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  channelName: string;
  channelId?: number;
  channelPublicID?: string;
  channelImage?: string;
  channelDescription?: string;
  channelSubscribers?: number;
  views: number;
  uploadedAt: string;
  badge?: string;
  url?: string;
  createdAt?: string;
  tags?: Array<{ id: number; name: string }> | string[] | string;
}

export interface VideoStats {
  id?: number;
  vidID: number;
  publicID?: string;
  views: number;
  likes: number;
}
