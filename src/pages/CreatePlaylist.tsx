import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { playlistsApi } from '../services/playlistsApi';
import '../styles/layout.css';
import '../styles/form.css';

const CreatePlaylist: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    isPremium: false,
    userID: 0, // Will be set by API
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

    if (!formData.name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    setLoading(true);
    try {
      await playlistsApi.create(formData);
      toast.success('Playlist created successfully!');
      navigate('/playlists');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to create playlist';
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
            <h1>Create a Playlist</h1>
            <p>Organize your videos into playlists</p>
          </div>

          <form onSubmit={handleSubmit} className="standard-form">
            <div className="form-section">
              <label className="form-label">Playlist Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter playlist name"
                className="form-input"
                disabled={loading}
                maxLength={100}
              />
              <p className="form-hint">{formData.name.length}/100 characters</p>
            </div>

            <div className="form-section">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your playlist..."
                className="form-textarea"
                rows={5}
                disabled={loading}
                maxLength={500}
              />
              <p className="form-hint">{formData.description.length}/500 characters</p>
            </div>

            <div className="form-section checkbox">
              <label>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Make this playlist public</span>
              </label>
              <p className="form-hint">Public playlists can be seen by anyone</p>
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
                <span>Premium content</span>
              </label>
              <p className="form-hint">Mark if this playlist contains premium/exclusive content</p>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Playlist'}
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

export default CreatePlaylist;
