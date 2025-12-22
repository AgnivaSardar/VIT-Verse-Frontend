import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoCard, { type Video } from '../components/common/VideoCard';
import PlaylistCard from '../components/common/PlaylistCard';
import { channelsApi } from '../services/channelsApi';
import { videosApi } from '../services/videosApi';
import { playlistsApi, type Playlist, type PlaylistDetail } from '../services/playlistsApi';
import type { Channel as ChannelType } from '../types';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';
import '../styles/video-grid.css';
import '../styles/channel.css';

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

function getPlaylistId(playlist: any): number {
  return Number(playlist.pID || playlist.id);
}

type TabType = 'videos' | 'playlists' | 'statistics' | 'edit';

const Channel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const channelId = Number(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [isOwner, setIsOwner] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; playlistId?: number; playlistName?: string }>({
    show: false,
  });

  useEffect(() => {
    if (!channelId) return;
    const load = async () => {
      setLoading(true);
      try {
        const [channelRes, videosRes] = await Promise.all([
          channelsApi.getById(channelId),
          videosApi.getAll(),
        ]);

        const channelData = unwrap<ChannelType | null>(channelRes) || null;
        setChannel(channelData);

        // Check if current user owns this channel
        if (user && channelData) {
          setIsOwner(channelData.userID === user.id);
        }

        const videoData = unwrap<any[] | undefined>(videosRes) || [];
        const mapped = (videoData || [])
          .filter((vid) => {
            const chanId = vid.channelId ?? vid.channelID;
            return Number(chanId) === channelId;
          })
          .map((vid) => ({
            id: vid.id ?? 0,
            title: vid.title ?? 'Untitled video',
            description: vid.description,
            thumbnail: vid.thumbnail,
            duration: vid.duration ?? 0,
            channelName: vid.channelName ?? channelData?.channelName ?? 'Unknown channel',
            channelImage: vid.channelImage,
            views: vid.views ?? 0,
            uploadedAt: vid.uploadedAt || vid.createdAt || 'Just now',
            badge: vid.badge,
            channelId: vid.channelId ?? vid.channelID,
          } as Video));
        setVideos(mapped);

        // Always load playlists (for all users to see)
        if (channelData) {
          try {
            const playlistsRes = await playlistsApi.getMyPlaylists();
            const playlistData = unwrap<Playlist[]>(playlistsRes) || [];

            const playlistsWithDetails = await Promise.all(
              playlistData.map(async (playlist) => {
                const playlistId = getPlaylistId(playlist);
                if (!playlistId) return { ...playlist } as PlaylistDetail;
                try {
                  const detailRes = await playlistsApi.getById(playlistId);
                  return unwrap<PlaylistDetail>(detailRes);
                } catch (error) {
                  console.error('Failed to fetch playlist detail', error);
                  return { ...playlist, id: playlistId } as PlaylistDetail;
                }
              })
            );

            setPlaylists(playlistsWithDetails);
          } catch (error) {
            console.error('Failed to load playlists:', error);
            setPlaylists([]);
          }
        }

        // Mock subscriber count (you can replace with actual API call)
        setSubscriberCount(Math.floor(Math.random() * 10000));
      } catch (error) {
        toast.error('Failed to load channel');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [channelId, user]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }
    try {
      if (subscribed) {
        await channelsApi.unsubscribe(channelId, user.id);
        setSubscribed(false);
        toast.success('Unsubscribed');
      } else {
        await channelsApi.subscribe(channelId, user.id);
        setSubscribed(true);
        toast.success('Subscribed!');
      }
    } catch (error) {
      toast.error('Subscription failed');
      console.error(error);
    }
  };

  const handleDeletePlaylist = async (playlistId: number) => {
    try {
      await playlistsApi.delete(playlistId);
      setPlaylists((prev) => prev.filter((p) => getPlaylistId(p) !== playlistId));
      toast.success('Playlist deleted');
      setDeleteModal({ show: false });
    } catch (error) {
      toast.error('Failed to delete playlist');
      console.error(error);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false });
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
          <>
            {/* Channel Header */}
            <div className="channel-header">
              <div className="channel-info">
                <div className="channel-avatar">
                  {channel.channelName?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="channel-details">
                  <h1>{channel.channelName}</h1>
                  <p>{channel.channelDescription || 'No description available'}</p>
                  
                  <div className="channel-stats">
                    <div className="stat-item">
                      <span className="stat-value">{videos.length}</span>
                      <span className="stat-label">Videos</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{playlists.length}</span>
                      <span className="stat-label">Playlists</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{subscriberCount.toLocaleString()}</span>
                      <span className="stat-label">Subscribers</span>
                    </div>
                  </div>

                  <div className="channel-actions">
                    {!isOwner && (
                      <button
                        className={`subscribe-btn ${subscribed ? 'subscribed' : ''}`}
                        onClick={handleSubscribe}
                      >
                        {subscribed ? '✓ Subscribed' : 'Subscribe'}
                      </button>
                    )}
                    <span className="channel-badge">{channel.channelType || 'public'}</span>
                    {isOwner && (
                      <button
                        className="subscribe-btn"
                        onClick={() => navigate(`/channel/${channelId}/edit`)}
                      >
                        Edit Channel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="channel-tabs">
              <button
                className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`}
                onClick={() => setActiveTab('videos')}
              >
                Videos
              </button>
              <button
                className={`tab-button ${activeTab === 'playlists' ? 'active' : ''}`}
                onClick={() => setActiveTab('playlists')}
              >
                Playlists
              </button>
              <button
                className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
                onClick={() => setActiveTab('statistics')}
              >
                Statistics
              </button>
              {isOwner && (
                <button
                  className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('edit')}
                >
                  Edit
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'videos' && (
                <div className="video-grid">
                  {videos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                  {!videos.length && (
                    <div className="no-results">No videos in this channel yet.</div>
                  )}
                </div>
              )}

              {activeTab === 'playlists' && (
                <div className="video-grid playlists-grid">
                  {playlists.map((playlist) => {
                    const playlistId = getPlaylistId(playlist);
                    if (!playlistId) return null;

                    return (
                      <PlaylistCard
                        key={playlistId}
                        playlist={playlist}
                        channelName={channel?.channelName}
                      />
                    );
                  })}
                  {!playlists.length && (
                    <div className="no-results">
                      {isOwner ? (
                        <>
                          No playlists yet.{' '}
                          <button
                            className="subscribe-btn"
                            onClick={() => navigate('/playlists/create')}
                          >
                            Create Playlist
                          </button>
                        </>
                      ) : (
                        'No playlists available.'
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'statistics' && (
                <>
                  <div className="stats-container">
                    <div className="stat-card">
                      <h3>Total Videos</h3>
                      <p className="value">{videos.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Views</h3>
                      <p className="value">
                        {videos.reduce((acc, v) => acc + (v.views || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="stat-card">
                      <h3>Subscribers</h3>
                      <p className="value">{subscriberCount.toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Playlists</h3>
                      <p className="value">{playlists.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Average Views</h3>
                      <p className="value">
                        {videos.length > 0
                          ? Math.round(
                              videos.reduce((acc, v) => acc + (v.views || 0), 0) / videos.length
                            ).toLocaleString()
                          : 0}
                      </p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Comments</h3>
                      <p className="value">{Math.floor(Math.random() * 500)}</p>
                    </div>
                  </div>

                  {/* Monthly Views Chart */}
                  <div className="stats-chart">
                    <h3>Monthly Views</h3>
                    <div className="chart-container">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
                        (month) => {
                          const height = Math.random() * 80 + 20;
                          const views = Math.floor(Math.random() * 5000 + 1000);
                          return (
                            <div key={month} className="chart-bar-wrapper">
                              <div className="chart-bar" style={{ height: `${height}%` }}>
                                <span className="bar-value">{views}</span>
                              </div>
                              <span className="bar-label">{month}</span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'edit' && isOwner && (
                <div className="edit-section">
                  <h3>Channel Management</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Manage your channel settings, playlists, and videos.
                  </p>
                  <div className="channel-actions">
                    <button
                      className="subscribe-btn"
                      onClick={() => navigate(`/channel/${channelId}/edit`)}
                    >
                      Edit Channel Info
                    </button>
                    <button
                      className="subscribe-btn"
                      onClick={() => navigate('/playlists/create')}
                    >
                      Create New Playlist
                    </button>
                    <button
                      className="subscribe-btn"
                      onClick={() => navigate('/upload')}
                    >
                      Upload Video
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="modal-overlay" onClick={closeDeleteModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Playlist?</h2>
              <p>
                Are you sure you want to delete "{deleteModal.playlistName}"? This action cannot be
                undone.
              </p>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={closeDeleteModal}>
                  Cancel
                </button>
                <button
                  className="modal-btn confirm"
                  onClick={() => handleDeletePlaylist(deleteModal.playlistId!)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Channel;
