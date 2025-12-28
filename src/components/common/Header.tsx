import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaVideo,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaEdit,
  FaPlayCircle,
  FaFilm,
  FaMoon,
  FaSun,
  FaUserShield,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useUI } from '../../contexts/UIContext';
import SearchBar from './SearchBar';
import { type Notification } from '../../services/notificationsApi';
import { channelsApi } from '../../services/channelsApi';
import type { Channel } from '../../types';
import '../../styles/header.css';

const Header: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userChannel, setUserChannel] = useState<Channel | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  // Sync sidebar state to body class - inverted to 'sidebar-open'
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('sidebar-open');
      document.body.classList.remove('sidebar-hidden');
    } else {
      document.body.classList.remove('sidebar-open');
      document.body.classList.add('sidebar-hidden');
    }
  }, [isSidebarOpen]);

  useEffect(() => {
    if (user) {
      channelsApi.getMyChannel()
        .then((response) => {
          // Verify we have a channel object
          const channel = (response as any).data || response;
          if (channel && (channel.id || channel.channelID)) {
            setUserChannel(channel);
          }
        })
        .catch((err) => {
          // It's okay if they don't have a channel, just ignore
          console.log('No channel found for user or error fetching:', err);
          setUserChannel(null);
        });
    } else {
      setUserChannel(null);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      // ...fetch logic here
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

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showUserMenu]);

  return (
    <header>
      <div className="logo-section">
        <FaBars className="menu-icon" onClick={toggleSidebar} />
        <Link to="/" className="brand" aria-label="Go to home">
          <h1>
            VIT-<span>Verse</span>
          </h1>
        </Link>
      </div>

      {/* pill wrapper */}
      <div className="search-wrapper">
        <SearchBar />
      </div>

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

        {/* New button next to user icon */}
        <div className="user-action-btn-wrapper">
          {!user ? (
            <button className="user-action-btn" onClick={() => navigate('/login')}>
              Log In
            </button>
          ) : (
            <button className="user-action-btn user-greet mobile-hidden" disabled>
              Hi, {user.name}
            </button>
          )}
        </div>

        <div className="icon-with-menu" ref={userMenuRef}>
          <img
            src={
              userChannel?.channelImage ||
              `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=1f2937&color=e2e8f0`
            }
            className="user-avatar"
            alt="Profile"
            title={userChannel ? `${userChannel.channelName}` : 'Profile'}
            onClick={handleAvatarClick}
          />
          {showUserMenu && (
            <div className="dropdown" style={{ overflow: 'visible' }}>
              <button className="dropdown-item" onClick={() => navigate('/profile')}>
                <FaUser /> Profile
              </button>
              <button className="dropdown-item" onClick={() => navigate('/profile/edit')}>
                <FaEdit /> Edit Profile
              </button>
              <hr className="dropdown-divider" />
              {userChannel ? (
                <>
                  <button
                    className="dropdown-item"
                    onClick={() =>
                      navigate(`/channel/${userChannel.channelID ?? userChannel.id}`)
                    }
                  >
                    <FaFilm /> My Channel
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => navigate('/playlists/create')}
                  >
                    <FaPlayCircle /> Create Playlist
                  </button>
                </>
              ) : (
                <button
                  className="dropdown-item"
                  onClick={() => navigate('/channels/create')}
                >
                  <FaFilm /> Create Channel
                </button>
              )}
              <hr className="dropdown-divider" />
              <button className="dropdown-item" onClick={() => navigate('/upload')}>
                <FaVideo /> Upload Video
              </button>
              {(user?.isSuperAdmin === true || user?.role === 'admin') && (
                <>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item admin-item" onClick={() => {
                    console.log('🔍 Navigating to admin dashboard');
                    navigate('/admin/dashboard');
                  }}>
                    <FaUserShield /> Admin Dashboard
                  </button>
                </>
              )}
              <hr className="dropdown-divider" />
              <div style={{ position: 'relative' }}>
                <button
                  className="dropdown-item"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowThemeDropdown((v) => !v);
                  }}
                  aria-haspopup="true"
                  aria-expanded={showThemeDropdown}
                >
                  {resolvedTheme === 'light' ? <FaSun /> : <FaMoon />}
                  Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
                {showThemeDropdown && (
                  <div
                    className="dropdown theme-submenu"
                    style={{
                      margin: '8px 0 0 0',
                      background: 'var(--card-bg)',
                      color: 'var(--text-main)',
                      border: '2px solid #6366f1',
                      borderRadius: 12,
                      boxShadow: '0 4px 16px rgba(99,102,241,0.10)',
                      zIndex: 2100,
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="dropdown-item"
                      style={{ width: '100%', textAlign: 'left', borderBottom: '1px solid var(--border)' }}
                      onClick={() => { setTheme('dark'); setShowThemeDropdown(false); }}
                    >🌑 Dark Mode</button>
                    <button
                      className="dropdown-item"
                      style={{ width: '100%', textAlign: 'left', borderBottom: '1px solid var(--border)' }}
                      onClick={() => { setTheme('light'); setShowThemeDropdown(false); }}
                    >🌕 Light Mode</button>
                    <button
                      className="dropdown-item"
                      style={{ width: '100%', textAlign: 'left' }}
                      onClick={() => { setTheme('system'); setShowThemeDropdown(false); }}
                    >💻 Device Default</button>
                  </div>
                )}
              </div>
              <hr className="dropdown-divider" />
              <button
                className="dropdown-item logout-item"
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


