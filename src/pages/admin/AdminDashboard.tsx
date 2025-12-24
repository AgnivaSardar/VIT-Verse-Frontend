// frontend/src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import './AdminDashboard.css';

interface DashboardStats {
  users: { total: number; active: number; inactive: number };
  channels: { total: number; public: number; hidden: number };
  videos: { total: number; public: number; hidden: number };
  playlists: { total: number; public: number; hidden: number };
  recentUsers: Array<{ name: string; email: string; role: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'channels' | 'videos' | 'playlists'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is super admin
  useEffect(() => {
    if (!isAuthenticated || user?.isSuperAdmin !== true) {
      // Show error message, do not redirect
      setError('You must be a super admin to access this page.');
    }
  }, [isAuthenticated, user]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get<DashboardStats>('/admin/stats');
        setStats(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || user?.isSuperAdmin !== true) {
    return null;
  }

  if (loading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h1>VIT-Verse Admin</h1>
          <p>Super Admin Panel</p>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={`nav-item ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveTab('channels')}
          >
            📺 Channels
          </button>
          <button
            className={`nav-item ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            🎬 Videos
          </button>
          <button
            className={`nav-item ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlists')}
          >
            📋 Playlists
          </button>
        </nav>

        <div className="admin-footer">
          <p>Logged in as: <strong>{user?.name}</strong></p>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('authToken');
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && stats && (
          <div className="overview-section">
            <h2>Dashboard Overview</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">👥 Users</div>
                <div className="stat-number">{stats.users.total}</div>
                <div className="stat-detail">
                  <span className="active">Active: {stats.users.active}</span>
                  <span className="inactive">Inactive: {stats.users.inactive}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">📺 Channels</div>
                <div className="stat-number">{stats.channels.total}</div>
                <div className="stat-detail">
                  <span className="public">Public: {stats.channels.public}</span>
                  <span className="hidden">Hidden: {stats.channels.hidden}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">🎬 Videos</div>
                <div className="stat-number">{stats.videos.total}</div>
                <div className="stat-detail">
                  <span className="public">Public: {stats.videos.public}</span>
                  <span className="hidden">Hidden: {stats.videos.hidden}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">📋 Playlists</div>
                <div className="stat-number">{stats.playlists.total}</div>
                <div className="stat-detail">
                  <span className="public">Public: {stats.playlists.public}</span>
                  <span className="hidden">Hidden: {stats.playlists.hidden}</span>
                </div>
              </div>
            </div>

            <div className="recent-users">
              <h3>Recent Users</h3>
              <div className="users-list">
                {stats.recentUsers.map((user, index) => (
                  <div key={index} className="user-item">
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="user-role">{user.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UsersTab />
        )}

        {activeTab === 'channels' && (
          <ChannelsTab />
        )}

        {activeTab === 'videos' && (
          <VideosTab />
        )}

        {activeTab === 'playlists' && (
          <PlaylistsTab />
        )}
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const url = `/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
        const response = await api.get<any[]>(url);
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, search]);

  const handleToggleStatus = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      // Refresh list
      setPage(1);
    } catch (err) {
      alert('Failed to toggle user status');
    }
  };

  return (
    <div className="tab-content">
      <h2>Users Management</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Email Verified</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={user.isActive ? 'status-active' : 'status-inactive'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <span className={user.isEmailVerified ? 'verified' : 'unverified'}>
                    {user.isEmailVerified ? '✓' : '✗'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleToggleStatus(user.id)}
                    disabled={user.isSuperAdmin}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Channels Tab Component
function ChannelsTab() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const url = `/admin/channels?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
        const response = await api.get<any[]>(url);
        setChannels(response.data);
      } catch (err) {
        console.error('Failed to fetch channels');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [page, search]);

  const handleToggleVisibility = async (channelId: string) => {
    try {
      await api.patch(`/admin/channels/${channelId}/toggle-visibility`);
      setPage(1);
    } catch (err) {
      alert('Failed to toggle channel visibility');
    }
  };

  return (
    <div className="tab-content">
      <h2>Channels Management</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or handle..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Loading channels...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Channel Name</th>
              <th>Owner</th>
              <th>Videos</th>
              <th>Subscribers</th>
              <th>Visibility</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((channel) => (
              <tr key={channel.id}>
                <td>{channel.name}</td>
                <td>{channel.owner}</td>
                <td>{channel.videosCount}</td>
                <td>{channel.subscribersCount}</td>
                <td>
                  <span className={channel.isAvailableToPublic ? 'public' : 'hidden'}>
                    {channel.isAvailableToPublic ? 'Public' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleToggleVisibility(channel.id)}
                  >
                    {channel.isAvailableToPublic ? 'Hide' : 'Show'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Videos Tab Component
function VideosTab() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const url = `/admin/videos?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
        const response = await api.get<any[]>(url);
        setVideos(response.data);
      } catch (err) {
        console.error('Failed to fetch videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [page, search]);

  const handleToggleVisibility = async (videoId: string) => {
    try {
      await api.patch(`/admin/videos/${videoId}/toggle-visibility`);
      setPage(1);
    } catch (err) {
      alert('Failed to toggle video visibility');
    }
  };

  return (
    <div className="tab-content">
      <h2>Videos Management</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Loading videos...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Channel</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Comments</th>
              <th>Visibility</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video.id}>
                <td>{video.title}</td>
                <td>{video.channelName}</td>
                <td>{video.viewsCount}</td>
                <td>{video.likesCount}</td>
                <td>{video.commentsCount}</td>
                <td>
                  <span className={video.isAvailableToPublic ? 'public' : 'hidden'}>
                    {video.isAvailableToPublic ? 'Public' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleToggleVisibility(video.id)}
                  >
                    {video.isAvailableToPublic ? 'Hide' : 'Show'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Playlists Tab Component
function PlaylistsTab() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const url = `/admin/playlists?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
        const response = await api.get<any[]>(url);
        setPlaylists(response.data);
      } catch (err) {
        console.error('Failed to fetch playlists');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, [page, search]);

  const handleToggleVisibility = async (playlistId: string) => {
    try {
      await api.patch(`/admin/playlists/${playlistId}/toggle-visibility`);
      setPage(1);
    } catch (err) {
      alert('Failed to toggle playlist visibility');
    }
  };

  return (
    <div className="tab-content">
      <h2>Playlists Management</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {loading ? (
        <p>Loading playlists...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Playlist Name</th>
              <th>Owner</th>
              <th>Videos</th>
              <th>Visibility</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map((playlist) => (
              <tr key={playlist.id}>
                <td>{playlist.name}</td>
                <td>{playlist.owner}</td>
                <td>{playlist.videosCount}</td>
                <td>
                  <span className={playlist.isAvailableToPublic ? 'public' : 'hidden'}>
                    {playlist.isAvailableToPublic ? 'Public' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-action"
                    onClick={() => handleToggleVisibility(playlist.id)}
                  >
                    {playlist.isAvailableToPublic ? 'Hide' : 'Show'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
