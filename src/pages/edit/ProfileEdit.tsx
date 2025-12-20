import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { usersApi, type User } from '../../services/usersApi';
import '../../styles/layout.css';
import '../../styles/video-detail.css';

const unwrap = <T>(resp: any): T => (resp && typeof resp === 'object' && 'data' in resp ? (resp as any).data : resp);

const ProfileEdit: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await usersApi.getById(user.id);
        const data = unwrap<User | undefined>(response);
        setProfile(data);
      } catch (error) {
        toast.error('Failed to load profile');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    setSaving(true);
    try {
      await usersApi.update(user.id, {
        username: profile.username,
        userEmail: profile.userEmail,
        userPhone: profile.userPhone,
        role: profile.role,
      });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Update failed');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main className="video-detail-page">
        {loading ? (
          <div className="loading">Loading profile...</div>
        ) : !user ? (
          <div className="no-results">Please log in to edit your profile.</div>
        ) : !profile ? (
          <div className="no-results">Profile not found.</div>
        ) : (
          <div className="sidebar-card">
            <h1>Edit Profile</h1>
            <form onSubmit={handleSubmit} className="comment-form">
              <label>Username</label>
              <input name="username" value={profile.username} onChange={handleChange} />
              <label>Email</label>
              <input name="userEmail" value={profile.userEmail} onChange={handleChange} />
              <label>Phone</label>
              <input name="userPhone" value={profile.userPhone || ''} onChange={handleChange} />
              <button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfileEdit;
