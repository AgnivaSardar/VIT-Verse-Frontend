import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Channel from './pages/Channel';
import VideoDetail from './pages/VideoDetail';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Trending from './pages/Trending';
import Subscriptions from './pages/Subscriptions';
import CreateChannel from './pages/CreateChannel';
import CreatePlaylist from './pages/CreatePlaylist';
import PlaylistView from './pages/PlaylistView';
import EditPlaylist from './pages/EditPlaylist';
import ChannelEdit from './pages/edit/ChannelEdit';
import ProfileEdit from './pages/edit/ProfileEdit';
import VideoEdit from './pages/edit/VideoEdit';
import AdminDashboard from './pages/AdminDashboard';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import About from './pages/footer/About';
import Copyright from './pages/footer/Copyright';
import Contact from './pages/footer/Contact';
import Developers from './pages/footer/Developers';
import Terms from './pages/footer/Terms';
import Privacy from './pages/footer/Privacy';
import Policy from './pages/footer/Policy';
import HowItWorks from './pages/footer/HowItWorks';
import NotFound from './pages/NotFound';
import { UIProvider } from './contexts/UIContext';
import CookieConsent from './components/common/CookieConsent';
import './App.css';
import './styles/layout.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UIProvider>
          <Router>
            <div className="App">
              <Toaster position="top-right" />
              <CookieConsent />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/channel/:id" element={<Channel />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/channels/create" element={<CreateChannel />} />
                <Route path="/video/:id" element={<VideoDetail />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/search" element={<Search />} />
                <Route path="/playlists/create" element={<CreatePlaylist />} />
                <Route path="/playlists/:id/edit" element={<EditPlaylist />} />
                <Route path="/playlists/:id" element={<PlaylistView />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/channel/:id/edit" element={<ChannelEdit />} />
                <Route path="/profile/edit" element={<ProfileEdit />} />
                <Route path="/video/:id/edit" element={<VideoEdit />} />
                <Route path="/about" element={<About />} />
                <Route path="/copyright" element={<Copyright />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/developers" element={<Developers />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/policy" element={<Policy />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;