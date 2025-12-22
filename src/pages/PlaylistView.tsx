import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoCard, { type Video } from '../components/common/VideoCard';
import { playlistsApi, type PlaylistDetail } from '../services/playlistsApi';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';
import '../styles/video-grid.css';
import '../styles/playlist.css';

const PlaylistView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playlistId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!playlistId) return;
      setLoading(true);
      try {
        const response = await playlistsApi.getById(playlistId);
        const data = response.data || response;
        setPlaylist(data);
        
        // Check if current user is the owner
        if (user && data.user?.userEmail === user.email) {
          setIsOwner(true);
        }
      } catch (error) {
        toast.error('Failed to load playlist');
        console.error(error);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [playlistId, user, navigate]);

  const handleRemoveVideo = async (playlistVideoId: number) => {
    if (!window.confirm('Remove this video from playlist?')) return;

    try {
      await playlistsApi.removeVideo(playlistId, playlistVideoId);
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              videos: prev.videos?.filter((v) => v.pvID !== playlistVideoId),
            }
          : null
      );
      toast.success('Video removed');
    } catch (error) {
      toast.error('Failed to remove video');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header />
        <Sidebar />
        <main className="playlist-view">
          <div className="loading">Loading playlist...</div>
        </main>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="app-container">
        <Header />
        <Sidebar />
        <main className="playlist-view">
          <div className="not-found">Playlist not found</div>
        </main>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const mapToVideoCard = (item: any, index: number): Video => {
    const video = item.video || {};
    const videoCreator = video.channel?.user?.userName || 'Unknown channel';
    
    // Get primary image from video's images array
    const thumbnailUrl = video.images && video.images.length > 0 
      ? video.images[0].imgURL 
      : undefined;

    return {
      id: Number(video.vidID || video.id || index),
      title: video.title || 'Untitled video',
      description: video.description || '',
      thumbnail: thumbnailUrl,
      duration: Number(video.duration) || 0,
      // Use the original video creator's channel name, not the playlist creator
      channelName: videoCreator,
      // Generate avatar for the original video creator
      channelImage: `https://ui-avatars.com/api/?name=${videoCreator}&background=1f2937&color=e5e7eb`,
      views: Number(video.views) || 0,
      uploadedAt: video.createdAt || video.uploadedAt || new Date().toISOString(),
      badge: video.badge,
      channelId: Number(video.channel?.channelID || video.channelId || video.channel?.id) || undefined,
    };
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main className="playlist-view">
        <div className="playlist-header">
          <div className="playlist-cover">
            <div className="cover-icon">
              {playlist.isPremium ? '⭐' : '📋'}
            </div>
          </div>

          <div className="playlist-info">
            <div className="info-badges">
              <span className="badge-privacy">
                {playlist.isPublic ? '🌐 Public' : '🔒 Private'}
              </span>
              {playlist.isPremium && <span className="badge-premium">⭐ Premium</span>}
            </div>

            <h1 className="playlist-title">{playlist.name}</h1>

            <p className="playlist-description">{playlist.description}</p>

            <div className="playlist-meta">
              <div className="meta-item">
                <span className="meta-label">Created by</span>
                <span className="meta-value">{playlist.user?.userName || 'Unknown'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Videos</span>
                <span className="meta-value">{playlist.videos?.length || 0}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Created</span>
                <span className="meta-value">{formatDate(playlist.createdAt)}</span>
              </div>
            </div>

            {isOwner && (
              <div className="playlist-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/playlists/${playlistId}/edit`)}
                >
                  ✏️ Edit Playlist
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/playlists/${playlistId}/edit`)}
                >
                  ➕ Add Videos
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="playlist-content">
          {playlist.videos && playlist.videos.length > 0 ? (
            <div className="videos-list">
              <h2>Videos in Playlist ({playlist.videos.length})</h2>
              <div className="video-grid playlist-video-grid">
                {playlist.videos.map((item, index) => {
                  const videoCard = mapToVideoCard(item, index);
                  return (
                    <div className="playlist-card-wrapper" key={item.pvID || videoCard.id}>
                      {isOwner && (
                        <button
                          className="btn-icon btn-remove remove-card"
                          onClick={() => item.pvID && handleRemoveVideo(item.pvID)}
                          title="Remove from playlist"
                        >
                          ✕
                        </button>
                      )}
                      <VideoCard video={videoCard} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎬</div>
              <h3>No videos yet</h3>
              <p>This playlist doesn't have any videos</p>
              {isOwner && (
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/playlists/${playlistId}/add-videos`)}
                >
                  Add Videos to Playlist
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlaylistView;
