import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../services/authApi';
import type { User } from '../features/auth/AuthContext';
import '../styles/layout.css';
import '../styles/video-detail.css';

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await authApi.getUser(user.id);
        const data = unwrap<User | undefined>(response);
        setProfile(data ?? null);
      } catch (error) {
        toast.error('Failed to load profile');
        console.error(error);
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main className="video-detail-page">
        {loading ? (
          <div className="loading">Loading profile...</div>
        ) : !isAuthenticated || !user ? (
          <div className="no-results">
            <p>Please log in to view your profile.</p>
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Go to Login</Link>
          </div>
        ) : (
          <div className="sidebar-card">
            <h1>{profile?.name || 'User'}</h1>
            <p>Email: {profile?.email}</p>
            <p>Role: {profile?.role}</p>
            <Link to="/profile/edit">Edit Profile</Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
