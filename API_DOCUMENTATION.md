# VIT-Verse API Services Documentation

This document provides a comprehensive guide to all API services available in the frontend application.

## Base Setup

All API requests are handled through the base `api` service which automatically:
- Includes authorization tokens
- Handles errors (401 redirects to login)
- Manages headers
- Converts responses to JSON

**Base URL:** `http://localhost:8080/api` (configurable via `VITE_API_URL`)

## Authentication API (`authApi.ts`)

### Login
```typescript
authApi.login(credentials: LoginRequest): Promise<LoginResponse>

// Body
{
  email: "test@example.com",
  password: "Pass123!"
}

// Response
{
  token: "jwt_token_here",
  userID: 1,
  name: "Test User",
  email: "test@example.com",
  role: "student"
}
```

### Register
```typescript
authApi.register(data: RegisterRequest): Promise<User>

// Body
{
  name: "Test User",
  email: "test@example.com",
  password: "Pass123!",
  role: "student"
}

// Response
{
  id: 1,
  name: "Test User",
  email: "test@example.com",
  role: "student"
}
```

### Get User
```typescript
authApi.getUser(userId: number): Promise<User>
```

## Videos API (`videosApi.ts`)

### Get All Videos
```typescript
videosApi.getAll(): Promise<Video[]>
```

### Get Single Video
```typescript
videosApi.getById(id: number): Promise<Video>
```

### Upload Video
```typescript
videosApi.upload(formData: FormData): Promise<any>

// Form data
{
  video: File,
  title?: string,
  description?: string,
  ... other metadata
}
```

### Video Stats
```typescript
// Get stats
videosApi.getStats(id: number): Promise<VideoStats>

// Increment views
videosApi.incrementViews(id: number): Promise<any>

// Increment likes (auth required)
videosApi.incrementLikes(id: number): Promise<any>

// Decrement likes (auth required)
videosApi.decrementLikes(id: number): Promise<any>
```

### Comments
```typescript
// Get all comments
videosApi.getComments(videoId: number): Promise<Comment[]>

// Add comment (auth required)
videosApi.addComment(data: {
  userID: number,
  vidID: number,
  description: string
}): Promise<Comment>

// Update comment (auth required)
videosApi.updateComment(id: number, data: {
  description: string
}): Promise<Comment>

// Delete comment (auth required)
videosApi.deleteComment(id: number): Promise<any>
```

### Likes
```typescript
// Get like count
videosApi.getLikesCount(videoId: number): Promise<number>

// Check if user liked
videosApi.hasLiked(userId: number, videoId: number): Promise<boolean>

// Like video (auth required)
videosApi.like(userId: number, videoId: number): Promise<any>

// Unlike video (auth required)
videosApi.unlike(userId: number, videoId: number): Promise<any>
```

## Channels API (`channelsApi.ts`)

### Get All Channels
```typescript
channelsApi.getAll(): Promise<Channel[]>
```

### Get Channel by ID
```typescript
channelsApi.getById(id: number): Promise<Channel>
```

### Get Channel by Name
```typescript
channelsApi.getByName(name: string, userId: number): Promise<Channel>
```

### Create Channel (auth required)
```typescript
channelsApi.create(data: Channel): Promise<Channel>

// Body
{
  userID: 2,
  channelName: "My Channel",
  channelDescription: "Channel description",
  channelType: "public",
  channelSubscribers: 0,
  isPremium: false
}
```

### Update Channel (auth required)
```typescript
channelsApi.update(id: number, data: Partial<Channel>): Promise<Channel>

// Body
{
  channelDescription: "Updated description",
  isPremium: true
}
```

### Delete Channel (auth required)
```typescript
channelsApi.delete(id: number): Promise<any>
```

### Subscribe to Channel (auth required)
```typescript
channelsApi.subscribe(channelId: number, userId: number): Promise<any>
```

### Unsubscribe from Channel (auth required)
```typescript
channelsApi.unsubscribe(channelId: number, userId: number): Promise<any>
```

## Users API (`usersApi.ts`)

### Get All Users
```typescript
usersApi.getAll(): Promise<User[]>
```

### Get User by ID
```typescript
usersApi.getById(id: number): Promise<User>
```

### Create User (auth required)
```typescript
usersApi.create(data: User): Promise<User>

// Body
{
  username: "alice",
  userEmail: "alice@example.com",
  userPassword: "Pass123!",
  role: "student"
}
```

### Update User (auth required)
```typescript
usersApi.update(id: number, data: Partial<User>): Promise<User>

// Body
{
  userPhone: "9876543210",
  isActive: true
}
```

### Activate User (auth required)
```typescript
usersApi.activate(id: number): Promise<any>
```

### Deactivate User (auth required)
```typescript
usersApi.deactivate(id: number): Promise<any>
```

### Delete User (auth required)
```typescript
usersApi.delete(id: number): Promise<any>
```

## Students API (`studentsApi.ts`)

### Get Student by ID
```typescript
studentsApi.getById(id: number): Promise<Student>
```

### Create Student (auth required)
```typescript
studentsApi.create(data: Student): Promise<Student>

// Body
{
  userID: 1,
  studentRegID: "20BCE9999",
  studentBranch: "CSE",
  studentYear: 3
}
```

### Update Student (auth required)
```typescript
studentsApi.update(regId: string, data: Partial<Student>): Promise<Student>

// Body
{
  studentYear: 4
}
```

### Delete Student (auth required)
```typescript
studentsApi.delete(regId: string): Promise<any>
```

## Teachers API (`teachersApi.ts`)

### Get All Teachers
```typescript
teachersApi.getAll(): Promise<Teacher[]>
```

### Get Teacher by ID
```typescript
teachersApi.getById(id: string): Promise<Teacher>
```

### Create Teacher (auth required)
```typescript
teachersApi.create(data: Teacher): Promise<Teacher>

// Body
{
  userID: 2,
  teacherID: "T003",
  teacherSchool: "School of Computing"
}
```

### Update Teacher (auth required)
```typescript
teachersApi.update(id: string, data: Partial<Teacher>): Promise<Teacher>

// Body
{
  teacherSchool: "Updated School"
}
```

### Delete Teacher (auth required)
```typescript
teachersApi.delete(id: string): Promise<any>
```

## Notifications API (`notificationsApi.ts`)

### Get All Notifications
```typescript
notificationsApi.getAll(): Promise<Notification[]>
```

### Get Notification by ID
```typescript
notificationsApi.getById(id: number): Promise<Notification>
```

### Get User Notifications (auth required)
```typescript
notificationsApi.getUserNotifications(userId: number): Promise<Notification[]>
```

### Create Notification (auth required)
```typescript
notificationsApi.create(data: Notification): Promise<Notification>

// Body
{
  userID: 1,
  entityID: 1,
  type: "message",
  message: "Hello"
}
```

### Mark as Read (auth required)
```typescript
notificationsApi.markAsRead(id: number): Promise<any>
```

### Update Notification (auth required)
```typescript
notificationsApi.update(id: number, data: Partial<Notification>): Promise<Notification>

// Body
{
  isRead: true,
  message: "Updated message"
}
```

### Delete Notification (auth required)
```typescript
notificationsApi.delete(id: number): Promise<any>
```

### Delete User Notifications (auth required)
```typescript
notificationsApi.deleteUserNotifications(userId: number): Promise<any>
```

## Playlists API (`playlistsApi.ts`)

### Get Playlist by ID
```typescript
playlistsApi.getById(id: number): Promise<Playlist>
```

### Create Playlist (auth required)
```typescript
playlistsApi.create(data: Playlist): Promise<Playlist>

// Body
{
  userID: 1,
  name: "My Favorites 2",
  description: "Study list",
  isPublic: true,
  isPremium: false
}
```

### Update Playlist (auth required)
```typescript
playlistsApi.update(id: number, data: Partial<Playlist>): Promise<Playlist>

// Body
{
  name: "Updated Playlist Name"
}
```

### Delete Playlist (auth required)
```typescript
playlistsApi.delete(id: number): Promise<any>
```

## Reports API (`reportsApi.ts`)

### Get Report by ID
```typescript
reportsApi.getById(id: number): Promise<Report>
```

### Create Report (auth required)
```typescript
reportsApi.create(data: Report): Promise<Report>

// Body
{
  reporterID: 1,
  vidID: 1,
  reason: "Inappropriate content"
}
```

### Update Report (auth required)
```typescript
reportsApi.update(id: number, data: Partial<Report>): Promise<Report>

// Body
{
  status: "resolved"
}
```

### Delete Report (auth required)
```typescript
reportsApi.delete(id: number): Promise<any>
```

## Views API (`viewsApi.ts`)

### Get All Views
```typescript
viewsApi.getAll(): Promise<VideoView[]>
```

### Get View by ID
```typescript
viewsApi.getById(id: number): Promise<VideoView>
```

### Create View (auth required)
```typescript
viewsApi.create(data: VideoView): Promise<VideoView>

// Body
{
  userID: 1,
  vidID: 1,
  watchTime: 120,
  ipAddress: "127.0.0.1",
  userAgent: "Postman"
}
```

### Update View (auth required)
```typescript
viewsApi.update(id: number, data: Partial<VideoView>): Promise<VideoView>

// Body
{
  watchTime: 300
}
```

### Delete View (auth required)
```typescript
viewsApi.delete(id: number): Promise<any>
```

## Images API (`imagesApi.ts`)

### Get Image by ID
```typescript
imagesApi.getById(id: number): Promise<Image>
```

### Create Image (auth required)
```typescript
imagesApi.create(data: Image): Promise<Image>

// Body
{
  vidID: 1,
  s3Bucket: "vit-images",
  s3Key: "thumbnails/new.jpg",
  imgURL: "https://cdn.example.com/new.jpg",
  isPrimary: true
}
```

### Update Image (auth required)
```typescript
imagesApi.update(id: number, data: Partial<Image>): Promise<Image>

// Body
{
  isPrimary: false
}
```

### Delete Image (auth required)
```typescript
imagesApi.delete(id: number): Promise<any>
```

## Tags API (`tagsApi.ts`)

### Get Tag by ID
```typescript
tagsApi.getById(id: number): Promise<Tag>
```

### Get Popular Tags
```typescript
tagsApi.getPopular(): Promise<Tag[]>
```

### Search Tags
```typescript
tagsApi.search(query: string): Promise<Tag[]>
```

### Create Tag (auth required)
```typescript
tagsApi.create(data: Tag): Promise<Tag>

// Body
{
  name: "AI",
  description: "Artificial Intelligence",
  color: "#FFAA00"
}
```

### Add Tags to Video (auth required)
```typescript
tagsApi.addToVideo(videoId: number, tags: string[]): Promise<any>

// Body
{
  tags: ["Computer Science", "Tutorial"]
}
```

### Get Video Tags
```typescript
tagsApi.getVideoTags(videoId: number): Promise<Tag[]>
```

## Subscriptions API (`subscriptionsApi.ts`)

### Subscribe (auth required)
```typescript
subscriptionsApi.subscribe(data: Subscription): Promise<any>

// Body
{
  userID: 1,
  channelID: 1
}
```

### Unsubscribe (auth required)
```typescript
subscriptionsApi.unsubscribe(data: Subscription): Promise<any>

// Body
{
  userID: 1,
  channelID: 1
}
```

## Jobs API (`jobsApi.ts`)

### Transcode Video (auth required)
```typescript
jobsApi.transcodeVideo(data: TranscodeJob): Promise<any>

// Body
{
  videoId: 5,
  quality: "1080p"
}
```

## Error Handling

All API errors are automatically handled:
- **401 Unauthorized**: User is redirected to login
- **Other Errors**: Should be caught and handled in components

Example:
```typescript
try {
  const videos = await videosApi.getAll();
  setVideos(videos.data);
} catch (error) {
  console.error('Failed to fetch videos:', error);
  toast.error('Failed to load videos');
}
```

## Authentication Header

All authenticated requests include:
```
Authorization: Bearer <token>
```

The token is automatically retrieved from `localStorage` and included in all requests marked as `auth: true`.

## Token Management

- **Login**: Token is stored in `localStorage.authToken`
- **Logout**: Token is removed from storage
- **Refresh**: Token is automatically included in requests
- **Expiry**: 401 response triggers automatic logout

## Environment Configuration

Set the API base URL in `.env.local`:
```
VITE_API_URL=http://your-backend-url/api
```
