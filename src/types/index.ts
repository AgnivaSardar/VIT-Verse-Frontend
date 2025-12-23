export interface Channel {
  // Backend uses `channelID` (bigint serialized to number)
  channelID?: number;
  // Some legacy code may still refer to `id`
  id?: number;
  userID?: number;
  channelName: string;
  channelDescription: string;
  channelType: 'public' | 'private' | 'protected';
  channelSubscribers?: number;
  isPremium?: boolean;
  channelImage?: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}
