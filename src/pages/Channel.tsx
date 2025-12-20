import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoCard, { type Video } from '../components/common/VideoCard';
import { channelsApi } from '../services/channelsApi';
import { videosApi } from '../services/videosApi';
import type { Channel as ChannelType } from '../types';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';
import '../styles/video-grid.css';
import '../styles/video-detail.css';

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

const Channel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const channelId = Number(id);
  const { user } = useAuth();

  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

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
      } catch (error) {
        toast.error('Failed to load channel');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [channelId]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please log in to subscribe');
      return;
    }
    try {
      if (subscribed) {
        await channelsApi.unsubscribe(channelId, user.id);
        setSubscribed(false);
      } else {
        await channelsApi.subscribe(channelId, user.id);
        setSubscribed(true);
      }
    } catch (error) {
      toast.error('Subscription failed');
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
          <>
            <div className="video-meta">
              <h1>{channel.channelName}</h1>
              <p>{channel.channelDescription}</p>
              <div className="actions">
                <button className={subscribed ? 'primary' : ''} onClick={handleSubscribe}>
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
                <span>Type: {channel.channelType}</span>
              </div>
            </div>

            <div className="video-grid">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
              {!videos.length && <div className="no-results">No videos in this channel yet.</div>}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Channel;
