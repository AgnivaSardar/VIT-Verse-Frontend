# VIT-Verse Frontend Design Implementation

## Overview
This is a modern video streaming platform frontend for VIT Chennai, built with React, TypeScript, and Vite. The design follows the provided specification with VIT branding and a clean, intuitive layout.

## Design Features

### Color Scheme
- **Primary Blue**: `#003366` (VIT Blue)
- **Light Blue**: `#00509d` (VIT Light Blue)
- **Accent Yellow**: `#ffcc00` (VIT Yellow)
- **Background**: `#f9f9f9` (Light Gray)
- **Text**: `#333` (Dark Gray)

### Layout Structure
```
┌─────────────────────────────────┐
│          HEADER (60px)          │
├────────────┬─────────────────────┤
│            │                     │
│  SIDEBAR   │      MAIN CONTENT   │
│ (240px)    │                     │
│            │  - Category Tags    │
│            │  - Video Grid       │
│            │                     │
├────────────┴─────────────────────┤
│    FLOATING UPLOAD BUTTON        │
└─────────────────────────────────┘
```

## Project Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── VideoCard.tsx
│   │   ├── CategoryTags.tsx
│   │   └── index.ts
│   ├── player/          # Video player components
│   │   ├── VideoPlayer.tsx
│   │   └── Controls.tsx
│   └── ui/              # Basic UI components
├── pages/               # Page components
│   ├── Home.tsx
│   ├── Channel.tsx
│   ├── VideoDetail.tsx
│   ├── Upload.tsx
│   ├── Profile.tsx
│   ├── Search.tsx
│   └── edit/
├── services/            # API client services
│   ├── api.ts           # Base API client
│   ├── authApi.ts
│   ├── channelsApi.ts
│   ├── videosApi.ts
│   ├── commentsApi.ts
│   ├── likesApi.ts
│   ├── notificationsApi.ts
│   └── ... (other APIs)
├── features/            # Feature-specific logic
│   ├── auth/
│   │   └── AuthContext.tsx
│   ├── channels/
│   ├── notifications/
│   ├── profiles/
│   └── videos/
├── hooks/               # Custom React hooks
│   ├── useAuth.ts
│   ├── useVideos.ts
│   └── ...
├── styles/              # CSS stylesheets
│   ├── layout.css       # Main layout styles
│   ├── header.css
│   ├── sidebar.css
│   ├── video-card.css
│   ├── tags.css
│   ├── video-grid.css
│   └── globals.css
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── App.tsx
```

## Key Components

### Header
- Logo with VITC-Stream branding
- Search bar for content discovery
- User icons (upload, notifications, profile)
- Responsive design for mobile

### Sidebar
- Main navigation (Home, Trending, Subscriptions)
- Department shortcuts (SCOPE, SENSE, SAS)
- Campus life events (Vibrance, Sports)
- Active state indicators
- Collapsible on mobile

### Video Card
- Thumbnail with duration overlay
- Channel image
- Video title with truncation
- Channel name with optional badge
- View count and upload time
- Hover effects for interaction

### Category Tags
- Horizontal scrollable tag list
- Active state styling
- Click handlers for filtering
- Popular categories: All, Python Programming, etc.

## API Integration

### Authentication
```typescript
// Login
POST /api/auth/login
Body: { email, password }
Response: { token, userID, name, email, role }

// Register
POST /api/auth/register
Body: { name, email, password, role }
Response: { id, name, email, role }
```

### Videos
```typescript
// Get all videos
GET /api/videos

// Get single video
GET /api/videos/:id

// Upload video
POST /api/videos/upload [auth]
Form-data: { video: File, ...metadata }

// Video stats
GET /api/videostats/:id
POST /api/videostats/:id/increment-views
POST /api/videostats/:id/increment-likes [auth]
```

### Channels
```typescript
// Get all channels
GET /api/channels

// Create channel
POST /api/channels [auth]
Body: { userID, channelName, channelDescription, channelType, isPremium }

// Subscribe/Unsubscribe
POST /api/channels/:id/subscribe [auth]
POST /api/channels/:id/unsubscribe [auth]
```

## Styling

### Responsive Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: Below 768px

### CSS Variables
```css
:root {
  --vit-blue: #003366;
  --vit-light-blue: #00509d;
  --vit-yellow: #ffcc00;
  --bg-color: #f9f9f9;
  --text-main: #333;
  --sidebar-width: 240px;
}
```

## Authentication Flow

1. User logs in via `/api/auth/login`
2. Token stored in `localStorage`
3. Token automatically included in all authenticated requests
4. Token expires, user is redirected to login
5. User can logout, clearing token and user data

## Features

### Current Features
- ✅ Home page with video grid
- ✅ Category filtering
- ✅ Video card display
- ✅ Header with search
- ✅ Sidebar navigation
- ✅ Responsive design
- ✅ Authentication context
- ✅ Complete API integration

### Planned Features
- 🔄 Video player page
- 🔄 Channel pages
- 🔄 User profiles
- 🔄 Upload functionality
- 🔄 Comment system
- 🔄 Like/favorite system
- 🔄 Notifications
- 🔄 Search functionality

## Setup & Running

```bash
# Install dependencies
npm install

# Configure environment
# Create .env.local with:
# VITE_API_URL=http://localhost:8080/api

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations
- Lazy loading for video cards
- Image optimization
- CSS minification
- Code splitting
- Responsive images

## Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast compliance
- Screen reader support

## Future Improvements
- Dark mode support
- Video recommendations algorithm
- Advanced search filters
- Playlist functionality
- Social sharing features
- Live streaming support
- Offline mode
- Progressive Web App (PWA) features
