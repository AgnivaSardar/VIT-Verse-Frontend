import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Channel from './pages/Channel';
import VideoDetail from './pages/VideoDetail';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Search from './pages/Search';
import CreateChannel from './pages/CreateChannel';
import CreatePlaylist from './pages/CreatePlaylist';
import ChannelEdit from './pages/edit/ChannelEdit';
import ProfileEdit from './pages/edit/ProfileEdit';
import VideoEdit from './pages/edit/VideoEdit';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import './App.css';
import './styles/layout.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/channel/:id" element={<Channel />} />
            <Route path="/channels/create" element={<CreateChannel />} />
            <Route path="/video/:id" element={<VideoDetail />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/playlists/create" element={<CreatePlaylist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/channel/:id/edit" element={<ChannelEdit />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/video/:id/edit" element={<VideoEdit />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
