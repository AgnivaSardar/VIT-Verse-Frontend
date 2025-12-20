# VIT-Verse Frontend - Professional Video Platform

A modern, responsive video streaming platform frontend for VIT Chennai, built with React, TypeScript, and Vite.

## 🎯 Project Overview

VITC-Stream is a complete video platform frontend featuring:
- Clean, professional UI matching VIT branding
- Comprehensive API integration with 30+ endpoints
- Responsive design for all devices
- Authentication system with token management
- Video management and streaming
- Comment and like systems
- Channel management
- User profiles
- Notification system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8080/api" > .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 📦 Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── services/          # API client services
├── features/          # Feature-specific logic
├── hooks/             # Custom React hooks
├── styles/            # CSS stylesheets
├── types/             # TypeScript definitions
├── utils/             # Utility functions
└── App.tsx            # Main application
```

## ✨ Features

### Core Features
- ✅ Home page with video grid
- ✅ Header with search bar
- ✅ Sidebar navigation
- ✅ Video cards with metadata
- ✅ Category filtering
- ✅ Responsive design
- ✅ Authentication
- ✅ Upload page

### API Integration
- ✅ 30+ API endpoints
- ✅ Authentication (login, register)
- ✅ Videos (CRUD, stats, comments, likes)
- ✅ Channels (subscribe, unsubscribe)
- ✅ Users and Students management
- ✅ Notifications
- ✅ Playlists
- ✅ Reports
- ✅ Tags and search

## 🎨 Design

### Color Scheme
- **Primary Blue**: #003366
- **Light Blue**: #00509d
- **Accent Yellow**: #ffcc00
- **Background**: #f9f9f9
- **Text**: #333

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## 🔧 Configuration

### Environment Variables
Create `.env.local` file:
```
VITE_API_URL=http://localhost:8080/api
```

### Development
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Check code quality
npm run preview  # Preview production build
```

## 📚 Documentation

- **DESIGN.md** - Design specifications and component details
- **API_DOCUMENTATION.md** - Complete API reference
- **QUICK_REFERENCE.md** - Developer quick start guide
- **IMPLEMENTATION_SUMMARY.md** - Implementation overview

## 🏗️ Architecture

### Component Structure
- **Header**: Logo, search, user icons
- **Sidebar**: Navigation with departments
- **VideoCard**: Video display with metadata
- **CategoryTags**: Tag filter system
- **Home Page**: Video grid layout

### State Management
- React Context API for authentication
- Local component state for UI
- Redux/Zustand ready for future enhancement

### API Layer
- Base API client with auto-auth token handling
- Modular service files for each resource
- Consistent error handling
- TypeScript interfaces for type safety

## 🔐 Authentication

### Flow
1. User logs in via `/api/auth/login`
2. Token stored in `localStorage`
3. Token automatically included in requests
4. 401 error triggers logout and redirect

### Security Features
- Bearer token authentication
- Automatic token refresh
- CORS support
- Secure localStorage management

## 📱 Responsive Design

### Mobile (< 768px)
- Collapsible sidebar
- Optimized video grid
- Touch-friendly buttons
- Horizontal scrolling for tags

### Tablet (768px - 1199px)
- Sidebar always visible
- 2-column video grid
- Full navigation

### Desktop (1200px+)
- Full sidebar
- Multi-column video grid
- Hover effects

## 🎯 Development Workflow

### Creating a New Page

```typescript
import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import '../styles/layout.css';

const MyPage: React.FC = () => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main>
        {/* Your content */}
      </main>
    </div>
  );
};

export default MyPage;
```

### Adding API Calls

```typescript
import { videosApi } from '../services/videosApi';

const videos = await videosApi.getAll();
const video = await videosApi.getById(1);
```

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Run with coverage
npm test -- --coverage
```

## 🐛 Troubleshooting

### Port already in use
```bash
npm run dev -- --port 3000
```

### API connection fails
- Check backend is running on `http://localhost:8080`
- Verify `.env.local` has correct API URL
- Check network tab in browser DevTools

### Styles not applying
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild: `npm run build`
- Check CSS file imports

## 📊 Performance

### Build Size
- HTML: 0.46 kB (gzip: 0.29 kB)
- CSS: 6.94 kB (gzip: 2.10 kB)
- JavaScript: 289.65 kB (gzip: 92.79 kB)

### Optimizations
- Code splitting
- Lazy loading
- Image optimization
- CSS minification
- Tree shaking

## 🔄 Version Info

- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **Vite**: 7.2.4
- **Node.js**: 18+

## 📝 License

This project is part of VIT Chennai's Video Platform initiative.

## 👥 Contributors

- Developed for VIT-Verse Platform
- Frontend Team

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review component examples
3. Check browser console
4. Use browser DevTools Network tab

## 🚀 Deployment

### Production Build
```bash
npm run build
# Output: dist/ folder
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Netlify
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set publish directory: `dist`

---

**Built with ❤️ for VIT Chennai**

Last Updated: December 20, 2025
