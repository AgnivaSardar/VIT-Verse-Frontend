# VIT-Verse Frontend - Quick Reference Guide

## Project Overview

**VITC-Stream** is a modern video streaming platform built for VIT Chennai community. The frontend is built with React, TypeScript, Vite, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Create .env.local
echo "VITE_API_URL=http://localhost:8080/api" > .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Key Features Implemented

✅ **Home Page** - Video grid with sample data
✅ **Header** - Logo, search bar, user icons
✅ **Sidebar** - Navigation menu with departments
✅ **Video Cards** - Responsive video display
✅ **Category Filter** - Tag-based filtering
✅ **Authentication Context** - User login/logout
✅ **API Services** - Complete API integration
✅ **Responsive Design** - Mobile, tablet, desktop

## Project Structure Quick Tour

```
src/
├── components/common/      → Header, Sidebar, VideoCard, etc.
├── pages/                  → Home, Channel, VideoDetail, Upload, Profile, Search
├── services/              → API clients for all endpoints
├── features/auth/         → Authentication context
├── hooks/                 → Custom React hooks (useAuth, etc.)
├── styles/                → CSS modules and global styles
├── types/                 → TypeScript type definitions
└── App.tsx               → Main app component
```

## Development Commands

```bash
# Start dev server on http://localhost:5173
npm run dev

# Build optimized production version
npm run build

# Run TypeScript type checking
npm run lint

# Preview production build locally
npm run preview
```

## API Integration Pattern

### Using API Services

```typescript
import { videosApi } from '../services/videosApi';

// In component
const [videos, setVideos] = useState<Video[]>([]);

useEffect(() => {
  videosApi.getAll()
    .then(res => setVideos(res.data))
    .catch(err => console.error(err));
}, []);
```

### Authentication

```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, login, logout, isLoading } = useAuth();

  return (
    <>
      {user && <p>Welcome, {user.name}</p>}
      <button onClick={() => logout()}>Logout</button>
    </>
  );
};
```

## Component Creation Guide

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
        {/* Your content here */}
      </main>
    </div>
  );
};

export default MyPage;
```

### Creating a New API Service

```typescript
import api from './api';

export interface MyEntity {
  id?: number;
  name: string;
}

export const myApi = {
  getAll: () => api.get<MyEntity[]>('endpoint'),
  getById: (id: number) => api.get<MyEntity>(`endpoint/${id}`),
  create: (data: MyEntity) => api.post<MyEntity>('endpoint', data, true),
  update: (id: number, data: Partial<MyEntity>) =>
    api.put<MyEntity>(`endpoint/${id}`, data, true),
  delete: (id: number) => api.delete(`endpoint/${id}`, true),
};
```

## Styling

### Using CSS Variables

```css
:root {
  --vit-blue: #003366;
  --vit-light-blue: #00509d;
  --vit-yellow: #ffcc00;
  --bg-color: #f9f9f9;
  --text-main: #333;
  --sidebar-width: 240px;
}

.my-element {
  background: var(--vit-blue);
  color: var(--text-main);
}
```

### Responsive Classes

```css
@media (max-width: 768px) {
  /* Tablet and mobile styles */
}

@media (max-width: 480px) {
  /* Mobile only styles */
}
```

## Common Tasks

### Add a New Navigation Link

Edit `src/components/common/Sidebar.tsx`:

```typescript
const newNav: NavLink[] = [
  { path: '/new-page', label: 'New Page', icon: <FaIcon /> },
];
```

### Fetch Data in a Component

```typescript
const [data, setData] = useState<MyType[]>([]);
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  apiCall()
    .then(res => {
      setData(res.data);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
}, []);
```

### Show Toast Notifications

```typescript
import toast from 'react-hot-toast';

// Success
toast.success('Operation successful!');

// Error
toast.error('Something went wrong');

// Loading
toast.loading('Please wait...');
```

## Debugging Tips

### Console Logging

```typescript
// Log API responses
console.log('Response:', response);

// Log component state changes
useEffect(() => {
  console.log('Videos changed:', videos);
}, [videos]);
```

### React DevTools

Install React DevTools browser extension to:
- Inspect component tree
- Check component state and props
- Profile performance
- See hook updates

### Network Tab

Use browser DevTools Network tab to:
- Inspect API requests/responses
- Check request headers
- Debug authentication issues

## Troubleshooting

### "Cannot find module" Error
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### Port 5173 already in use
```bash
# Use different port
npm run dev -- --port 3000
```

### API requests failing (401)
- Check if token is in localStorage
- Verify token hasn't expired
- Check API URL in .env.local
- Ensure backend is running

### Styles not applying
- Check if CSS file is imported
- Verify CSS class names match HTML
- Check CSS specificity
- Use browser DevTools to inspect

## Performance Optimization

### Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export default () => (
  <Suspense fallback={<LoadingSpinner />}>
    <HeavyComponent />
  </Suspense>
);
```

### Memoization

```typescript
import { memo, useMemo } from 'react';

const VideoCard = memo(({ video }: Props) => {
  return <div>{video.title}</div>;
});

const MyComponent = () => {
  const memoizedValue = useMemo(() => expensiveCalculation(), [deps]);
};
```

## Useful Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [React Hot Toast](https://react-hot-toast.com)

## Common Patterns

### Fetch and Display Data

```typescript
const [items, setItems] = useState<Item[]>([]);

useEffect(() => {
  const fetchItems = async () => {
    try {
      const res = await itemsApi.getAll();
      setItems(res.data);
    } catch (error) {
      toast.error('Failed to load items');
    }
  };
  
  fetchItems();
}, []);

return (
  <div>
    {items.map(item => (
      <ItemCard key={item.id} item={item} />
    ))}
  </div>
);
```

### Handle Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const res = await api.post('endpoint', formData, true);
    toast.success('Success!');
    // Reset or navigate
  } catch (error) {
    toast.error('Failed to submit');
  }
};
```

## Next Steps for Development

1. **Connect Real API** - Update API URLs to your backend
2. **Implement Search** - Add search functionality to SearchBar
3. **Build Video Detail** - Create video player and details page
4. **Add Comments** - Implement comment system
5. **User Profiles** - Complete profile pages
6. **Upload Video** - Full video upload workflow
7. **Notifications** - Real-time notification system
8. **Dark Mode** - Add dark theme toggle

## Support

For issues or questions:
1. Check documentation in `DESIGN.md` and `API_DOCUMENTATION.md`
2. Review component examples in existing pages
3. Check React and TypeScript documentation
4. Use browser DevTools for debugging
