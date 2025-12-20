import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaVideo, FaBell, FaUser, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { notificationsApi, type Notification } from '../../services/notificationsApi';
import '../../styles/header.css';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    document.body.classList.toggle('sidebar-hidden', !next);
  };

  const fetchNotifications = async () => {
    if (!user) {
      toast.error('Please log in to view notifications');
      return;
    }
    setNotifLoading(true);
    try {
      const resp = await notificationsApi.getUserNotifications(user.id);
      const data = (resp as any)?.data ?? resp;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Could not load notifications');
      console.error(error);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleBellClick = () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      fetchNotifications();
    }
  };

  const handleAvatarClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowUserMenu((prev) => !prev);
    setShowNotifications(false);
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove('sidebar-hidden');
    };
  }, []);

  return (
    <header>
      <div className="logo-section">
        <FaBars className="menu-icon" onClick={toggleSidebar} />
        <h1>
          VIT-<span>Verse</span>
        </h1>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for lectures, clubs, events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">
          <FaSearch />
        </button>
      </form>

      <div className="user-icons">
        <Link to="/upload" title="Upload Video">
          <FaVideo />
        </Link>
        <div className="icon-with-menu">
          <FaBell onClick={handleBellClick} />
          {showNotifications && (
            <div className="dropdown notifications">
              <div className="dropdown-header">Notifications</div>
              {notifLoading && <div className="dropdown-item muted">Loading...</div>}
              {!notifLoading && notifications.length === 0 && (
                <div className="dropdown-item muted">No notifications</div>
              )}
              {!notifLoading &&
                notifications.map((note) => (
                  <div key={note.id || note.message} className="dropdown-item">
                    <div className="note-message">{note.message}</div>
                    <div className="note-meta">{note.type}</div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="icon-with-menu">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=ffcc00&color=003366`}
            className="user-avatar"
            alt="Profile"
            title="Profile"
            onClick={handleAvatarClick}
          />
          {showUserMenu && (
            <div className="dropdown">
              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                <FaUser /> Profile
              </button>
              <button className="dropdown-item" onClick={() => navigate('/profile/edit')}>
                <FaEdit /> Edit Profile
              </button>
              <button className="dropdown-item" onClick={() => navigate('/upload')}>
                <FaVideo /> Upload
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                  navigate('/');
                }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
