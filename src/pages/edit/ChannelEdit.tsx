import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUpload, FaCheck } from 'react-icons/fa';
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');

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
      if (logoFile) {
        const form = new FormData();
        form.append('channelName', channel.channelName);
        form.append('channelDescription', channel.channelDescription);
        form.append('channelType', channel.channelType as any);
        form.append('isPremium', String(channel.isPremium));
        form.append('channelLogo', logoFile);
        await channelsApi.update(channelId, form as any);
      } else {
        await channelsApi.update(channelId, {
          channelName: channel.channelName,
          channelDescription: channel.channelDescription,
          channelType: channel.channelType,
          isPremium: channel.isPremium,
        });
      }
      toast.success('Channel updated');
    } catch (error) {
      toast.error('Update failed');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!channel) return;
    if (confirmName.trim() !== channel.channelName.trim()) {
      toast.error('Channel name mismatch');
      return;
    }
    if (confirmPhrase !== 'DELETE') {
      toast.error('Type DELETE to confirm');
      return;
    }
    try {
      await channelsApi.delete(channelId);
      toast.success('Channel deleted');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete channel');
      console.error(error);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main>
        {loading ? (
          <div className="loading">Loading channel...</div>
        ) : !channel ? (
          <div className="no-results">Channel not found.</div>
        ) : (
          <div className="upload-container" style={{ maxWidth: 920 }}>
            <div className="upload-header">
              <h1>Edit Channel</h1>
              <p>Update your channel identity, description, and logo.</p>
            </div>

            <form onSubmit={handleSubmit} className="upload-form">
              <div className="upload-field">
                <label className="upload-label">Channel Name *</label>
                <input
                  type="text"
                  name="channelName"
                  value={channel.channelName}
                  onChange={handleChange}
                  placeholder="Enter channel name"
                  className="upload-input"
                  disabled={saving}
                />
              </div>

              <div className="upload-field">
                <label className="upload-label">Description</label>
                <textarea
                  name="channelDescription"
                  value={channel.channelDescription}
                  onChange={handleChange}
                  placeholder="Describe your channel"
                  className="upload-textarea"
                  rows={4}
                  disabled={saving}
                />
              </div>

              <div className="upload-field">
                <label className="upload-label">Visibility</label>
                <select
                  name="channelType"
                  value={channel.channelType}
                  onChange={handleChange}
                  className="upload-input"
                  disabled={saving}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="protected">Protected</option>
                </select>
              </div>

              <div className="upload-field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label className="upload-label" style={{ margin: 0 }}>Premium</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(channel.isPremium)}
                    onChange={(e) => setChannel((prev) => (prev ? { ...prev, isPremium: e.target.checked } : prev))}
                    disabled={saving}
                  />
                  <span style={{ fontSize: 14, color: '#bfc5d2' }}>Mark channel as premium</span>
                </label>
              </div>

              <div className="upload-field">
                <label className="upload-label">Channel Logo</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="file-input"
                    id="channel-logo-input"
                    disabled={saving}
                  />
                  <label htmlFor="channel-logo-input" className="file-upload-area">
                    <FaUpload className="upload-icon" />
                    <div>
                      {logoFile ? (
                        <p><FaCheck className="check-icon" /> {logoFile.name}</p>
                      ) : (
                        <p>Click to select a logo image</p>
                      )}
                      <small className="upload-hint">PNG/JPG, recommended 512x512</small>
                    </div>
                  </label>
                </div>

                {(logoFile || channel.channelImage) && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 96,
                        height: 96,
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid #1c1f27',
                        background: '#0f1117',
                      }}
                    >
                      <img
                        src={logoFile ? URL.createObjectURL(logoFile) : channel.channelImage || ''}
                        alt="channel logo preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 14 }}>
                      Preview • This is how your logo will appear across the app
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="secondary-btn" onClick={() => navigate(-1)} disabled={saving}>
                  Cancel
                </button>
              </div>
            </form>

            <div className="sidebar-card" style={{ marginTop: 20 }}>
              <h3 style={{ color: '#f87171' }}>Danger Zone</h3>
              <p>Deleting your channel will remove all videos and data. This cannot be undone.</p>
              <div className="comment-form">
                <label>Type channel name to confirm</label>
                <input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} />
                <label>Type DELETE to confirm</label>
                <input value={confirmPhrase} onChange={(e) => setConfirmPhrase(e.target.value)} />
                <button
                  type="button"
                  className="modal-btn confirm"
                  onClick={handleDeleteChannel}
                  style={{ marginTop: 8 }}
                >
                  Delete Channel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChannelEdit;
