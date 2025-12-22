import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { channelsApi } from '../../services/channelsApi';
import { useAuth } from '../../hooks/useAuth';
import type { Channel } from '../../types';
import '../../styles/layout.css';
import '../../styles/video-detail.css';

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

const ChannelEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const channelId = Number(id);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please log in to edit a channel');
      navigate('/login', { replace: true });
      return;
    }
    if (!isAuthenticated || !channelId) return;
    const fetchChannel = async () => {
      setLoading(true);
      try {
        const response = await channelsApi.getById(channelId);
        const data = unwrap<Channel | undefined>(response);
        setChannel(data ?? null);
      } catch (error) {
        toast.error('Failed to load channel');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [channelId, isAuthenticated, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setChannel((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channel) return;
    setSaving(true);
    try {
      await channelsApi.update(channelId, {
        channelName: channel.channelName,
        channelDescription: channel.channelDescription,
        channelType: channel.channelType,
        isPremium: channel.isPremium,
      });
      toast.success('Channel updated');
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
          <div className="loading">Loading channel...</div>
        ) : !channel ? (
          <div className="no-results">Channel not found.</div>
        ) : (
          <div className="sidebar-card">
            <h1>Edit Channel</h1>
            <form onSubmit={handleSubmit} className="comment-form">
              <label>Name</label>
              <input
                name="channelName"
                value={channel.channelName}
                onChange={handleChange}
                className="form-input"
              />
              <label>Description</label>
              <textarea
                name="channelDescription"
                value={channel.channelDescription}
                onChange={handleChange}
              />
              <label>Type</label>
              <select name="channelType" value={channel.channelType} onChange={handleChange}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(channel.isPremium)}
                  onChange={(e) => setChannel((prev) => (prev ? { ...prev, isPremium: e.target.checked } : prev))}
                />
                Premium
              </label>
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

export default ChannelEdit;
