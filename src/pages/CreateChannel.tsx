import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { channelsApi } from '../services/channelsApi';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';
import '../styles/form.css';

const CreateChannel: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please log in to create a channel');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  const [formData, setFormData] = useState({
    channelName: '',
    channelDescription: '',
    channelType: 'public' as 'public' | 'private' | 'protected',
    isPremium: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.channelName.trim()) {
      toast.error('Please enter a channel name');
      return;
    }

    setLoading(true);
    try {
      // Send only the channel data, userID will be added by backend from auth
      await channelsApi.create({
        channelName: formData.channelName,
        channelDescription: formData.channelDescription,
        channelType: formData.channelType,
        isPremium: formData.isPremium,
      } as any);
      toast.success('Channel created successfully!');
      navigate('/upload');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to create channel';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main>
        <div className="form-container">
          <div className="form-header">
            <h1>Create Your Channel</h1>
            <p>Every creator on VIT-Verse needs a channel to publish videos</p>
          </div>

          <form onSubmit={handleSubmit} className="standard-form">
            <div className="form-section">
              <label className="form-label">Channel Name *</label>
              <input
                type="text"
                name="channelName"
                value={formData.channelName}
                onChange={handleChange}
                placeholder="Enter your channel name"
                className="form-input"
                disabled={loading}
                maxLength={100}
              />
              <p className="form-hint">{formData.channelName.length}/100 characters</p>
            </div>

            <div className="form-section">
              <label className="form-label">Description</label>
              <textarea
                name="channelDescription"
                value={formData.channelDescription}
                onChange={handleChange}
                placeholder="Tell us about your channel..."
                className="form-textarea"
                rows={5}
                disabled={loading}
                maxLength={500}
              />
              <p className="form-hint">{formData.channelDescription.length}/500 characters</p>
            </div>

            <div className="form-section">
              <label className="form-label">Channel Type</label>
              <select
                name="channelType"
                value={formData.channelType}
                onChange={handleChange}
                className="form-input"
                disabled={loading}
              >
                <option value="public">Public (Everyone can view)</option>
                <option value="private">Private (Only you can view)</option>
                <option value="protected">Protected (Only subscribed members)</option>
              </select>
              <p className="form-hint">Choose who can access your channel and videos</p>
            </div>

            <div className="form-section checkbox">
              <label>
                <input
                  type="checkbox"
                  name="isPremium"
                  checked={formData.isPremium}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Premium Channel (Requires membership)</span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Channel'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateChannel;
