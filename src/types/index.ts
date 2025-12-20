export interface Channel {
  id?: number;
  userID?: number;
  channelName: string;
  channelDescription: string;
  channelType: 'public' | 'private';
  channelSubscribers?: number;
  isPremium?: boolean;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}
