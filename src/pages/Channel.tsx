import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUsers, FaVideo, FaCalendarAlt, FaChild } from 'react-icons/fa';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoCard, { type Video } from '../components/common/VideoCard';
import EditVideoModal from '../components/videos/EditVideoModal';
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

function getPlaylistId(playlist: any): string | number {
  return playlist.publicID || playlist.pID || playlist.id;
}

function getVideoId(video: any): string | number {
  return video.publicID || video.vidID || video.vidId || video.id || 0;
}

type TabType = 'videos' | 'playlists' | 'about' | 'statistics' | 'edit';

const Channel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const channelId = id; // Could be numeric OR public ID string
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVideo] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; playlistId?: number; playlistName?: string }>({
    show: false,
  });
  const [deleteVideoModal, setDeleteVideoModal] = useState<{ show: boolean; vidId?: string | number; title?: string }>({
    show: false,
  });
  const [deletingVideoId, setDeletingVideoId] = useState<string | number | null>(null);
  const [stats, setStats] = useState<{ totalVideos: number; totalViews: number; totalLikes: number; totalComments: number; totalShares: number; subscribers: number; totalPlaylists: number; monthlyViews: { month: string; count: number }[] } | null>(null);

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

        // Check if current user owns this channel. Backend may set `isOwner` in sanitized response.
        if (user && channelData) {
          const ownerFlag = Boolean((channelData as any).isOwner) || Number(channelData.userID) === Number(user.id);
          setIsOwner(ownerFlag);
        }

        const videoData = unwrap<any[] | undefined>(videosRes) || [];
        const mapped = (videoData || [])
          .filter((vid) => {
            const vidChannelID = vid.channelID ?? vid.channelId;
            const vidChannelPublicID = vid.channelPublicID ?? vid.channel?.publicID;
            return (vidChannelPublicID && vidChannelPublicID === channelId) ||
              Number(vidChannelID) === Number(channelId);
          })
          .map((vid) => ({
            id: vid.vidID ?? vid.id ?? 0,
            publicID: vid.publicID,
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
            channelPublicID: vid.channelPublicID ?? vid.channel?.publicID,
          } as Video));
        setVideos(mapped);

        // Load playlists: if the viewer owns the channel, load their playlists (including private); otherwise load public playlists and filter
        if (channelData) {
          try {
            const isOwnerLocal = Boolean(user && channelData && (Boolean((channelData as any).isOwner) || Number(channelData.userID) === Number(user.id)));
            console.debug('Channel playlits load: channelData, user, isOwnerLocal', { channelData, user, isOwnerLocal });

            if (isOwnerLocal) {
              // Authenticated request that returns owner's playlists (may include private)
              const myPlaylistsRes = await playlistsApi.getMyPlaylists();
              const myPlaylists = unwrap<Playlist[] | undefined>(myPlaylistsRes) || [];
              console.debug('Channel: fetched myPlaylists', { count: myPlaylists.length, sample: myPlaylists[0] });
              setPlaylists(myPlaylists as unknown as PlaylistDetail[]);
            } else {
              const playlistsRes = await playlistsApi.getAll();
              const allPlaylists = unwrap<PlaylistDetail[] | undefined>(playlistsRes) || [];
              console.debug('Channel: fetched public playlists', { count: allPlaylists.length, sample: allPlaylists[0] });

              const filtered = allPlaylists.filter((pl: any) => {
                const ownerUserID = pl.userID ?? pl.user?.userID;
                const plChannelID = pl.channelID ?? pl.channelId;
                const plChannelPublicID = pl.channelPublicID ?? pl.channel?.publicID;
                // Additional fallbacks: nested user.channels or first video channel
                const fallbackChannelPublicID = pl.user?.channels?.[0]?.publicID || (pl.videos?.[0]?.video?.channel?.publicID);
                // fallbackChannelID derived for fallback logic (used in error cases)
                // Numeric channel id from current channel data
                const numericChannelID = Number(channelData.channelID ?? channelData.id ?? 0);
                    // Note: intentionally NOT counting playlists just because they contain a video from this channel
                    // (previously this caused playlists created by other channels to appear here).
                return (
                  (ownerUserID && Number(ownerUserID) === Number(channelData.userID)) ||
                  (plChannelPublicID && plChannelPublicID === channelId) ||
                  (plChannelID && Number(plChannelID) === numericChannelID) ||
                    (fallbackChannelPublicID && fallbackChannelPublicID === channelId) ||
                    (pl.user && pl.user.userID && Number(pl.user.userID) === Number(channelData.userID)) ||
                    (pl.user && pl.user.channels && pl.user.channels.some((c: any) => Number(c.channelID) === numericChannelID))
                );
              });

              console.debug('Channel: filtered public playlists', { count: filtered.length, sample: filtered[0] });
              setPlaylists(filtered);
            }
          } catch (error) {
            console.error('Failed to load playlists:', error);
            setPlaylists([]);
          }
        }

        // Use actual subscriber count from channel
        // Use actual subscriber count from channel
        setSubscriberCount(Number(channelData?.channelSubscribers ?? 0));

        // Fetch stats only for owner (backend may provide isOwner flag)
        if (user && channelData && (Boolean((channelData as any).isOwner) || Number(channelData.userID) === Number(user.id))) {
          try {
            const res = await (channelsApi as any).getStats?.(channelId);
            const data = unwrap<any>(res);
            if (data) setStats(data);
          } catch (e) {
            // ignore errors; stats optional
          }
        }
      } catch (error) {
        toast.error('Failed to load channel');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [channelId, user]);

  // Initialize subscribed state
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user || !channelId) {
        if (mounted) setSubscribed(false);
        return;
      }
      try {
        const res = await (await import('../services/subscriptionsApi')).subscriptionsApi.mine();
        const list = unwrap<any[]>(res) || [];

        // Determine whether current route param is numeric id or publicID (CH-...)
        const isPublic = typeof channelId === 'string' && channelId.startsWith('CH-');
        const numericChannelId = Number(channelId);

        const found = list.some((sub: any) => {
          // subscription may include nested channel object
          const subChannel = sub.channel || {};

          if (isPublic) {
            // match against public ids
            return (
              (subChannel.publicID && subChannel.publicID === channelId) ||
              (sub.publicID && sub.publicID === channelId) ||
              (sub.channelPublicID && sub.channelPublicID === channelId)
            );
          }

          // numeric comparison
          return (
            Number(sub.channelID ?? sub.id ?? subChannel.channelID) === numericChannelId ||
            Number(sub.user?.channels?.[0]?.channelID) === numericChannelId
          );
        });

        if (mounted) setSubscribed(Boolean(found));
      } catch (e) {
        // silent
      }
    })();
    return () => { mounted = false; };
  }, [user, channelId]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }
    try {
      const targetChannelId = channel?.channelID ?? channelId;
      if (subscribed) {
        await channelsApi.unsubscribe(targetChannelId, user.id!);
        setSubscribed(false);
        toast.success('Unsubscribed');
      } else {
        await channelsApi.subscribe(targetChannelId, user.id!);
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

  const openDeleteVideoModal = (vidId: number, title?: string) => {
    setDeleteVideoModal({ show: true, vidId, title });
  };

  const closeDeleteVideoModal = () => {
    setDeleteVideoModal({ show: false });
  };

  const confirmDeleteVideo = async () => {
    const vidId = deleteVideoModal.vidId;
    if (!vidId) return;
    try {
      setDeletingVideoId(vidId);
      await videosApi.delete(vidId);
      setVideos((prev) => prev.filter((v) => getVideoId(v) !== vidId));
      toast.success('Video deleted');
      closeDeleteVideoModal();
    } catch (error) {
      toast.error('Failed to delete video');
      console.error(error);
    } finally {
      setDeletingVideoId(null);
    }
  };

  const handleVideoSaved = (updated: any) => {
    // Update local videos list with returned updated data
    const id = updated?.publicID ?? updated?.vidID ?? updated?.id;
    setVideos((prev) => prev.map((v) => ((v.publicID && v.publicID === id) || Number(v.id) === Number(id) ? { ...v, ...updated } : v)));
    toast.success('Video updated');
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
                <img
                  className="channel-avatar"
                  src={
                    channel.channelImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      channel.channelName || 'C'
                    )}&background=1f2937&color=e5e7eb`
                  }
                  alt={channel.channelName}
                />
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
                      user ? (
                        <button
                          className={`subscribe-btn${subscribed ? ' subscribed' : ''}`}
                          onClick={handleSubscribe}
                        >
                          {subscribed && user ? '✓ Subscribed' : 'Subscribe'}
                        </button>
                      ) : (
                        <button
                          className="subscribe-btn"
                          onClick={handleSubscribe}
                        >
                          Subscribe
                        </button>
                      )
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
                className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
              {isOwner && (
                <button
                  className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
                  onClick={() => setActiveTab('statistics')}
                >
                  Statistics
                </button>
              )}
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
                    <div key={video.id}>
                      <VideoCard video={video} />
                    </div>
                  ))}
                  {!videos.length && (
                    <div className="no-results">No videos in this channel yet.</div>
                  )}
                </div>
              )}

              {editingVideo && (
                <EditVideoModal
                  isOpen={editModalOpen}
                  onRequestClose={() => setEditModalOpen(false)}
                  video={editingVideo}
                  onSaved={handleVideoSaved}
                />
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



              {activeTab === 'about' && (
                <div className="about-section">
                  <h3>About {channel?.channelName}</h3>
                  {channel?.channelDescription ? (
                    <p>{channel.channelDescription}</p>
                  ) : (
                    <div className="about-empty">
                      <p>No description provided yet.</p>
                    </div>
                  )}

                  <div className="about-grid">
                    <div className="about-item">
                      <strong>
                        <FaChild style={{ marginRight: '6px', marginBottom: '4px' }} />
                        Channel Type
                      </strong>
                      <span style={{ textTransform: 'capitalize' }}>{channel?.channelType || 'public'}</span>
                    </div>

                    <div className="about-item">
                      <strong>
                        <FaCalendarAlt style={{ marginRight: '6px', marginBottom: '4px' }} />
                        Joined
                      </strong>
                      <span>{new Date((channel as any)?.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <div className="about-item">
                      <strong>
                        <FaUsers style={{ marginRight: '6px', marginBottom: '4px' }} />
                        Subscribers
                      </strong>
                      <span>{subscriberCount.toLocaleString()}</span>
                    </div>

                    <div className="about-item">
                      <strong>
                        <FaVideo style={{ marginRight: '6px', marginBottom: '4px' }} />
                        Total Videos
                      </strong>
                      <span>{videos.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'statistics' && isOwner && (
                <>
                  <div className="stats-container">
                    <div className="stat-card">
                      <h3>Total Videos</h3>
                      <p className="value">{(stats?.totalVideos ?? videos.length).toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Views</h3>
                      <p className="value">{(stats?.totalViews ?? videos.reduce((acc, v) => acc + (v.views || 0), 0)).toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Subscribers</h3>
                      <p className="value">{(stats?.subscribers ?? subscriberCount).toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Playlists</h3>
                      <p className="value">{(stats?.totalPlaylists ?? playlists.length).toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Average Views</h3>
                      <p className="value">
                        {(() => {
                          const tv = stats?.totalViews ?? videos.reduce((acc, v) => acc + (v.views || 0), 0);
                          const count = stats?.totalVideos ?? videos.length;
                          return count > 0 ? Math.round(tv / count).toLocaleString() : '0';
                        })()}
                      </p>
                    </div>
                    <div className="stat-card">
                      <h3>Total Comments</h3>
                      <p className="value">{(stats?.totalComments ?? 0).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Monthly Views Chart */}
                  <div className="stats-chart">
                    <h3>Monthly Views</h3>
                    <div className="chart-container">
                      {(stats?.monthlyViews ?? []).map(({ month, count }) => {
                        const heightPct = Math.min(100, Math.max(10, (count / Math.max(1, (stats?.totalViews ?? count))) * 100));
                        return (
                          <div key={month} className="chart-bar-wrapper">
                            <div className="chart-bar" style={{ height: `${heightPct}%` }}>
                              <span className="bar-value">{count}</span>
                            </div>
                            <span className="bar-label">{month}</span>
                          </div>
                        );
                      })}
                      {!stats?.monthlyViews?.length && <div className="no-results">No monthly data</div>}
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

                  <div className="manage-videos-panel">
                    <h4>Your Videos</h4>
                    {!videos.length ? (
                      <div className="no-results">No videos uploaded yet.</div>
                    ) : (
                      <div className="video-manage-list">
                        {videos.map((v) => {
                          const vidId = getVideoId(v);
                          return (
                            <div key={vidId || v.title} className="video-manage-row">
                              <div className="video-manage-info">
                                <div className="video-title">{v.title}</div>
                                <div className="video-meta">{(v.views || 0).toLocaleString()} views · {v.uploadedAt}</div>
                              </div>
                              <button
                                className="modal-btn confirm"
                                onClick={() => navigate(`/video/${vidId}/edit`)}
                              >
                                Edit
                              </button>
                              <button
                                className="modal-btn confirm"
                                onClick={() => openDeleteVideoModal(Number(vidId), v.title)}
                                disabled={deletingVideoId === vidId}
                              >
                                {deletingVideoId === vidId ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

        {deleteVideoModal.show && (
          <div className="modal-overlay" onClick={closeDeleteVideoModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Video?</h2>
              <p>
                Are you sure you want to delete "{deleteVideoModal.title || 'this video'}"? This action cannot be undone.
              </p>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={closeDeleteVideoModal}>
                  Cancel
                </button>
                <button
                  className="modal-btn confirm"
                  onClick={confirmDeleteVideo}
                  disabled={deletingVideoId === deleteVideoModal.vidId}
                >
                  {deletingVideoId === deleteVideoModal.vidId ? 'Deleting...' : 'Delete'}
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
