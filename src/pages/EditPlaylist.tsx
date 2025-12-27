import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoSearchFilter, { type Video } from '../components/common/VideoSearchFilter';
import { playlistsApi, type Playlist, type PlaylistDetail } from '../services/playlistsApi';
import { videosApi } from '../services/videosApi';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';
import '../styles/playlist-form.css';

const EditPlaylist: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playlistId = Number(id);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Set<number>>(new Set());
  const [originalSelectedVideos, setOriginalSelectedVideos] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [playlistVideoMap, setPlaylistVideoMap] = useState<Map<number, number>>(new Map());

  const [formData, setFormData] = useState<Playlist>({
    name: '',
    description: '',
    isPublic: true,
    isPremium: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please log in to edit a playlist');
      navigate('/login', { replace: true });
      return;
    }

    if (!isAuthenticated) return;

    const loadData = async () => {
      setInitialLoading(true);
      try {
        // Load playlist details
        const playlistRes = await playlistsApi.getById(playlistId);
        const playlist: PlaylistDetail = playlistRes.data || playlistRes;
        setFormData({
          name: playlist.name,
          description: playlist.description,
          isPublic: playlist.isPublic,
          isPremium: playlist.isPremium,
        });

        // Load videos
        const videosRes = await videosApi.getAll();
        const loadedVideos = videosRes.data || [];
        setVideos(loadedVideos);
        setFilteredVideos(loadedVideos);

        // Mark existing playlist videos as selected
        if (playlist.videos && Array.isArray(playlist.videos)) {
          const selectedSet = new Set<number>();
          const vidMap = new Map<number, number>();
          playlist.videos.forEach((pv: any) => {
            const videoId = Number(pv.video?.vidID || pv.vidID || 0);
            const pvId = Number(pv.pvID || 0);
            selectedSet.add(videoId);
            vidMap.set(videoId, pvId);
          });
          setSelectedVideos(selectedSet);
          setOriginalSelectedVideos(new Set(selectedSet));
          setPlaylistVideoMap(vidMap);
        }
      } catch (error) {
        toast.error('Failed to load playlist');
        console.error(error);
        navigate(-1);
      } finally {
        setInitialLoading(false);
      }
    };

    if (playlistId) loadData();
  }, [playlistId, navigate, isAuthenticated, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const toggleVideoSelection = (id: any) => {
    const videoId = Number(id);
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
      // Update playlist details
      await playlistsApi.update(playlistId, formData);

      // Find videos to add and remove
      const videosToAdd = new Set<number>();
      const videosToRemove = new Set<number>();

      // Check for new videos
      selectedVideos.forEach((videoId) => {
        if (!originalSelectedVideos.has(videoId)) {
          videosToAdd.add(videoId);
        }
      });

      // Check for removed videos
      originalSelectedVideos.forEach((videoId) => {
        if (!selectedVideos.has(videoId)) {
          videosToRemove.add(videoId);
        }
      });

      // Add new videos
      for (const videoId of videosToAdd) {
        try {
          await playlistsApi.addVideo(playlistId, videoId);
        } catch (err: any) {
          console.error(`Failed to add video ${videoId}:`, err);
          toast.error(`Failed to add one or more videos`);
        }
      }

      // Remove videos
      for (const videoId of videosToRemove) {
        const pvId = playlistVideoMap.get(videoId);
        if (pvId) {
          try {
            await playlistsApi.removeVideo(playlistId, pvId);
          } catch (err: any) {
            console.error(`Failed to remove video ${videoId}:`, err);
          }
        }
      }

      toast.success('Playlist updated successfully!');

      // Add a small delay to ensure data is persisted before redirecting
      setTimeout(() => {
        navigate(`/playlists/${playlistId}`);
      }, 500);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to update playlist';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    setIsDeleting(true);
    try {
      await playlistsApi.delete(playlistId);
      toast.success('Playlist deleted successfully!');
      navigate('/playlists');
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to delete playlist';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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

  if (initialLoading) {
    return (
      <div className="app-container">
        <Header />
        <Sidebar />
        <main>
          <div className="playlist-form-container">
            <div className="loading">Loading playlist...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main>
        <div className="playlist-form-container">
          <div className="form-header">
            <h1>Edit Playlist</h1>
            <p>Update your playlist details and videos</p>
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
                Manage Videos ({selectedVideos.size} selected)
              </h2>

              <VideoSearchFilter
                videos={videos}
                onFilterChange={setFilteredVideos}
                disabled={loading}
              />

              <div className="videos-selection">
                {filteredVideos.length > 0 ? (
                  <div className="videos-list-compact">
                    {[...filteredVideos].sort((a, b) => {
                      const aId = Number(a.vidID || a.id || 0);
                      const bId = Number(b.vidID || b.id || 0);
                      const aSelected = selectedVideos.has(aId);
                      const bSelected = selectedVideos.has(bId);
                      if (aSelected && !bSelected) return -1;
                      if (!aSelected && bSelected) return 1;
                      return 0;
                    }).map((video) => {
                      const videoId = Number(video.vidID || video.id || 0);
                      const isSelected = selectedVideos.has(videoId);
                      const isExisting = originalSelectedVideos.has(videoId);
                      return (
                        <label
                          key={videoId}
                          className={`video-item ${isSelected ? 'selected' : ''} ${isExisting ? 'existing' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleVideoSelection(videoId);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }} // Handle via label onClick
                            disabled={loading}
                          />
                          <div className="video-item-content">
                            <div className="video-item-title">
                              {video.title}
                              {isExisting && <span className="existing-badge">Already in playlist</span>}
                            </div>
                            <div className="video-item-creator">
                              {video.channel?.user?.userName || video.channel?.channelName}
                            </div>
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
                {loading ? 'Updating...' : 'Update Playlist'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/playlists/${playlistId}`)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading || isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Playlist'}
              </button>
            </div>
          </form>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Delete Playlist?</h2>
                  <button
                    className="modal-close"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    ✕
                  </button>
                </div>
                <div className="modal-body">
                  <p>
                    Are you sure you want to delete <strong>"{formData.name}"</strong>?
                  </p>
                  <p className="warning-text">
                    ⚠️ This action cannot be undone. All videos in this playlist will be removed from the playlist (not deleted).
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDeletePlaylist}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Playlist'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditPlaylist;
