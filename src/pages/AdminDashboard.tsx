import React, { useEffect, useState } from 'react';
import {
  FaUsers,
  FaVideo,
  FaFilm,
  FaEye,
  FaChartLine,
  FaPlus,
  FaSearch,
  FaToggleOn,
  FaToggleOff,
  FaUserShield,
  FaCrown,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { adminApi, type AdminUser, type AdminChannel, type AdminVideo, type DashboardStats } from '../services/adminApi';
import '../styles/layout.css';
import '../styles/admin-dashboard.css';

const AdminDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'channels' | 'videos'>('stats');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [channels, setChannels] = useState<AdminChannel[]>([]);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  
  // Create User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'admin' | 'student' | 'teacher',
    isSuperAdmin: false,
  });

  useEffect(() => {
    if (isLoading) return; // wait for auth state restore
    const isAdmin = !!(user && (user.role === 'admin' || user.isSuperAdmin));
    if (!isAdmin) {
      // Don't navigate away abruptly on refresh; show message in place
      toast.error('Access denied. Admins only.');
      return;
    }
    loadStats();
  }, [user, isLoading]);

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    else if (activeTab === 'channels') loadChannels();
    else if (activeTab === 'videos') loadVideos();
  }, [activeTab, currentPage, searchTerm]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getStats();
      console.log('📊 Admin stats response:', response);
      setStats(response.data);
    } catch (error) {
      console.error('❌ Failed to load stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllUsers({ page: currentPage, limit: 20, search: searchTerm });
      const payload = (response as any)?.data?.data ?? [];
      const pagination = (response as any)?.data?.pagination ?? { totalPages: 1 };
      setUsers(Array.isArray(payload) ? payload : []);
      setTotalPages(Number(pagination.totalPages) || 1);
    } catch (error) {
      console.error('Users load error:', error);
      toast.error('Failed to load users');
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllChannels({ page: currentPage, limit: 20, search: searchTerm });
      const payload = (response as any)?.data?.data ?? [];
      const pagination = (response as any)?.data?.pagination ?? { totalPages: 1 };
      setChannels(Array.isArray(payload) ? payload : []);
      setTotalPages(Number(pagination.totalPages) || 1);
    } catch (error) {
      console.error('Channels load error:', error);
      toast.error('Failed to load channels');
      setChannels([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllVideos({ page: currentPage, limit: 20, search: searchTerm });
      const payload = (response as any)?.data?.data ?? [];
      const pagination = (response as any)?.data?.pagination ?? { totalPages: 1 };
      setVideos(Array.isArray(payload) ? payload : []);
      setTotalPages(Number(pagination.totalPages) || 1);
    } catch (error) {
      console.error('Videos load error:', error);
      toast.error('Failed to load videos');
      setVideos([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await adminApi.createUser(newUser);
      toast.success('User created successfully');
      setShowCreateUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'student', isSuperAdmin: false });
      loadUsers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create user');
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await adminApi.toggleUserStatus(userId);
      toast.success('User status updated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleToggleChannelVisibility = async (channelId: string) => {
    try {
      await adminApi.toggleChannelVisibility(channelId);
      toast.success('Channel visibility updated');
      loadChannels();
    } catch (error) {
      toast.error('Failed to update channel visibility');
    }
  };

  const handleToggleVideoVisibility = async (videoId: string) => {
    try {
      await adminApi.toggleVideoVisibility(videoId);
      toast.success('Video visibility updated');
      loadVideos();
    } catch (error) {
      toast.error('Failed to update video visibility');
    }
  };

  return (
    <>
      <Header />
      <Sidebar />
      <main>
        <div className="admin-dashboard">
          <div className="admin-header">
            <div className="admin-title">
              <FaUserShield className="admin-icon" />
              <h1>Super Admin Dashboard</h1>
            </div>
            <p className="admin-subtitle">Complete control and management of VIT-Verse</p>
          </div>

      {/* Tabs */}
      {user && (user.role === 'admin' || user.isSuperAdmin) && (
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => { setActiveTab('stats'); setCurrentPage(1); }}
        >
          <FaChartLine /> Statistics
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); setCurrentPage(1); }}
        >
          <FaUsers /> Users
        </button>
        <button
          className={`admin-tab ${activeTab === 'channels' ? 'active' : ''}`}
          onClick={() => { setActiveTab('channels'); setCurrentPage(1); }}
        >
          <FaFilm /> Channels
        </button>
        <button
          className={`admin-tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => { setActiveTab('videos'); setCurrentPage(1); }}
        >
          <FaVideo /> Videos
        </button>
      </div>
      )}

      {/* Content */}
      <div className="admin-content">
        {/* Access Guard */}
        {(!isLoading && !(user && (user.role === 'admin' || user.isSuperAdmin))) ? (
          <p className="loading-text">Access denied. Admins only.</p>
        ) : null}
        {(user && (user.role === 'admin' || user.isSuperAdmin)) ? (
          <>
        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <>
            {loading ? (
              <p className="loading-text">Loading statistics...</p>
            ) : stats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <FaUsers className="stat-icon" />
                  <div className="stat-info">
                    <h3>{stats.totalUsers || 0}</h3>
                    <p>Total Users</p>
                    <span className="stat-detail">{stats.activeUsers || 0} active</span>
                  </div>
                </div>
                <div className="stat-card">
                  <FaFilm className="stat-icon" />
                  <div className="stat-info">
                    <h3>{stats.totalChannels || 0}</h3>
                    <p>Total Channels</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FaVideo className="stat-icon" />
                  <div className="stat-info">
                    <h3>{stats.totalVideos || 0}</h3>
                    <p>Total Videos</p>
                  </div>
                </div>
                <div className="stat-card">
                  <FaEye className="stat-icon" />
                  <div className="stat-info">
                    <h3>{(stats.totalViews || 0).toLocaleString()}</h3>
                    <p>Total Views</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="loading-text">No statistics available</p>
            )}
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="section-header">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <button className="create-btn" onClick={() => setShowCreateUserModal(true)}>
                <FaPlus /> Create User
              </button>
            </div>

            {loading ? (
              <p className="loading-text">Loading...</p>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Verified</th>
                      <th>Super Admin</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge badge-${user.role}`}>{user.role}</span>
                        </td>
                        <td>
                          <span className={`badge ${user.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{user.isEmailVerified ? '✓' : '✗'}</td>
                        <td>{user.isSuperAdmin ? <FaCrown className="crown-icon" /> : '-'}</td>
                        <td>
                          <button
                            className="action-btn"
                            onClick={() => handleToggleUserStatus(user.id)}
                            disabled={user.isSuperAdmin}
                            title={user.isSuperAdmin ? 'Cannot modify super admin' : 'Toggle status'}
                          >
                            {user.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Channels Tab */}
        {activeTab === 'channels' && (
          <div className="admin-section">
            <div className="section-header">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            {loading ? (
              <p className="loading-text">Loading...</p>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Channel Name</th>
                      <th>Owner</th>
                      <th>Videos</th>
                      <th>Subscribers</th>
                      <th>Public</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((channel) => (
                      <tr key={channel.id}>
                        <td>{channel.name}</td>
                        <td>{channel.owner} ({channel.ownerEmail})</td>
                        <td>{channel.videosCount}</td>
                        <td>{channel.subscribersCount}</td>
                        <td>
                          <span className={`badge ${channel.isAvailableToPublic ? 'badge-active' : 'badge-inactive'}`}>
                            {channel.isAvailableToPublic ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn"
                            onClick={() => handleToggleChannelVisibility(channel.id)}
                            title="Toggle visibility"
                          >
                            {channel.isAvailableToPublic ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="admin-section">
            <div className="section-header">
              <div className="search-box">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            {loading ? (
              <p className="loading-text">Loading...</p>
            ) : (
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Channel</th>
                      <th>Views</th>
                      <th>Duration</th>
                      <th>Visibility</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((video) => (
                      <tr key={video.id}>
                        <td>{video.title}</td>
                        <td>{video.channelName}</td>
                        <td>{video.views.toLocaleString()}</td>
                        <td>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</td>
                        <td>
                          <span className={`badge badge-${video.visibility}`}>{video.visibility}</span>
                        </td>
                        <td>
                          <button
                            className="action-btn"
                            onClick={() => handleToggleVideoVisibility(video.id)}
                            title="Toggle visibility"
                          >
                            {video.visibility === 'public' ? <FaToggleOn /> : <FaToggleOff />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
          </>
        ) : null}
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="modal-overlay" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New User</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'student' | 'teacher' })}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newUser.isSuperAdmin}
                    onChange={(e) => setNewUser({ ...newUser, isSuperAdmin: e.target.checked })}
                  />
                  Super Admin
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateUserModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
          </div>
        </main>
      </>
  );
};

export default AdminDashboard;
