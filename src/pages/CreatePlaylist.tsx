import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoSearchFilter, { type Video } from '../components/common/VideoSearchFilter';
import { playlistsApi } from '../services/playlistsApi';
import { videosApi } from '../services/videosApi';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';
import '../styles/form.css';
import '../styles/playlist-form.css';

const CreatePlaylist: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
    isPremium: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please log in to create a playlist');
      // Do not redirect, just block form rendering below
      return;
    }
    if (isAuthenticated) {
      loadVideos();
    }
  }, [isAuthenticated, isLoading]);

  const loadVideos = async () => {
    try {
      const response = await videosApi.getAll();
      setVideos(response.data || []);
      setFilteredVideos(response.data || []);
    } catch (error) {
      console.error('Failed to load videos:', error);
      toast.error('Failed to load videos');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleVideoSelection = (videoId: number) => {
    const newSelected = new Set(selectedVideos);
    if (newSelected.has(videoId)) {
      newSelected.delete(videoId);
    } else {
      newSelected.add(videoId);
    }
    setSelectedVideos(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    if (selectedVideos.size === 0) {
      toast.error('Please select at least one video');
      return;
    }

    setLoading(true);
    try {
      const response = await playlistsApi.create(formData);
      const playlistData = (response as any).data?.data || (response as any).data || response;
      const playlistId = playlistData?.pID || playlistData?.id;
      const numericPlaylistId = typeof playlistId === 'number' ? playlistId : Number(playlistId);

      if (!numericPlaylistId) {
        throw new Error('Could not determine playlist id');
      }

      // Add selected videos to playlist
      const videoErrors = [];
      for (const videoId of selectedVideos) {
        try {
          await playlistsApi.addVideo(numericPlaylistId, videoId);
        } catch (err: any) {
          console.error(`Failed to add video ${videoId}:`, err);
          videoErrors.push(`Failed to add video ${videoId}`);
        }
      }

      if (videoErrors.length > 0) {
        console.warn('Some videos failed to add:', videoErrors);
        toast.success(`Playlist created with ${selectedVideos.size - videoErrors.length} videos!`);
      } else {
        toast.success('Playlist created successfully with all videos!');
      }

      // Add a small delay to ensure data is persisted before redirecting
      setTimeout(() => {
        navigate(`/playlists/${numericPlaylistId}`);
      }, 500);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to create playlist';
      toast.error(errorMsg);
      console.error('Playlist creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main>
        <div className="playlist-form-container">
          <div className="form-header">
            <h1>Create a Playlist</h1>
            <p>Organize your videos into playlists</p>
          </div>

          <form onSubmit={handleSubmit} className="playlist-form">
            {/* Playlist Details Section */}
            <div className="form-section">
              <h2 className="section-title">Playlist Details</h2>

              <div className="form-group">
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

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your playlist..."
                  className="form-textarea"
                  rows={4}
                  disabled={loading}
                  maxLength={500}
                />
                <p className="form-hint">{formData.description.length}/500 characters</p>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
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

              <div className="checkbox-group">
                <label className="checkbox-label">
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
            </div>

            {/* Videos Selection Section */}
            <div className="form-section">
              <h2 className="section-title">
                Add Videos ({selectedVideos.size} selected)
              </h2>

              <VideoSearchFilter 
                videos={videos}
                onFilterChange={setFilteredVideos}
                disabled={loading}
              />

              <div className="videos-selection">
                {filteredVideos.length > 0 ? (
                  <div className="videos-list-compact">
                    {filteredVideos.map((video) => {
                      const videoId = video.vidID || video.id || 0;
                      const isSelected = selectedVideos.has(videoId);
                      return (
                        <label
                          key={videoId}
                          className={`video-item ${isSelected ? 'selected' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleVideoSelection(videoId)}
                            disabled={loading}
                          />
                          <div className="video-item-content">
                            <div className="video-item-title">{video.title}</div>
                            <div className="video-item-date">
                              Posted: {formatDate(video.createdAt || video.uploadedAt)}
                            </div>
                          </div>
                          {isSelected && <div className="video-item-check">✓</div>}
                        </label>
                      );
                    })}
                  </div>
                ) : videos.length === 0 ? (
                  <div className="empty-videos">
                    <p>No videos available yet</p>
                  </div>
                ) : (
                  <div className="empty-videos">
                    <p>No videos match your search</p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || selectedVideos.size === 0}
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
