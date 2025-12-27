import React, { useState, useEffect, useMemo } from 'react';
import { useUI } from '../contexts/UIContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import CategoryTags from '../components/common/CategoryTags';
import VideoCard, { type Video } from '../components/common/VideoCard';
import ChannelCard from '../components/common/ChannelCard';
import PlaylistCard from '../components/common/PlaylistCard';
import { videosApi } from '../services/videosApi';
import { channelsApi } from '../services/channelsApi';
import { subscriptionsApi } from '../services/subscriptionsApi';
import { playlistsApi, type Playlist } from '../services/playlistsApi';
import { tagsApi } from '../services/tagsApi';
import type { Channel } from '../types';
import '../styles/layout.css';
import '../styles/video-grid.css';
import '../styles/search.css';

// Helper to normalize video data
const mapVideo = (video: any, index: number = 0): Video => {
  const channelObj = video.channel || video.Channel || video.channelInfo;
  const channelId = video.channelId ?? video.channelID ?? channelObj?.channelID ?? channelObj?.id;
  const channelName =
    video.channelName ||
    channelObj?.channelName ||
    channelObj?.name ||
    channelObj?.user?.userName ||
    'Unknown channel';
  const channelImage = video.channelImage || channelObj?.channelImage || channelObj?.image || channelObj?.user?.userImage;
  const rawId = video.vidID ?? video.videoID ?? video.id;
  const parsedId = typeof rawId === 'string' ? parseInt(rawId, 10) : Number(rawId);
  const thumb = video.thumbnail || video.images?.[0]?.imgURL;

  return {
    id: Number.isFinite(parsedId) && !Number.isNaN(parsedId) ? parsedId : index + 1,
    title: video.title ?? 'Untitled video',
    description: video.description,
    thumbnail: thumb,
    duration: video.duration ?? 0,
    channelName,
    channelImage,
    views: video.views ?? 0,
    uploadedAt: video.uploadedAt || video.createdAt || 'Just now',
    badge: video.badge,
    channelId,
  };
};

const mapChannel = (ch: any): Channel => ({
  ...ch,
  id: ch.id ?? ch.channelID,
});

type FeedSectionType = 'videos' | 'channels' | 'subscribed-videos' | 'playlists';

interface FeedSection {
  id: string;
  type: FeedSectionType;
  title: string;
  data: any[];
}

const Home: React.FC = () => {
  const { isSidebarOpen } = useUI();
  const [activeTag, setActiveTag] = useState('All');
  const [tags, setTags] = useState<string[]>(['All']);

  // Raw Data
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [subscriptions, setSubscriptions] = useState<number[]>([]); // channel IDs
  const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);

  const [loading, setLoading] = useState(true);

  // Constants for row sizing
  const VIDEO_ROW_SIZE = 4; // Approx videos per row on desktop
  const CHANNEL_ROW_SIZE = 5; // Approx channels per row
  const PLAYLIST_ROW_SIZE = 5; // Approx playlists per row

  // Data fetching
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [tagsRes, videosRes, channelsRes, subsRes, playlistsRes] = await Promise.allSettled([
          tagsApi.getPopular(),
          videosApi.getAll(),
          channelsApi.getAll(),
          subscriptionsApi.mine(),
          playlistsApi.getAll(), // Fetch ALL playlists
        ]);

        // Tags
        if (tagsRes.status === 'fulfilled') {
          const data = (tagsRes.value as any)?.data ?? tagsRes.value;
          if (Array.isArray(data)) setTags(['All', ...data.map((t: any) => t.name)]);
        }

        // Videos
        if (videosRes.status === 'fulfilled') {
          const data = (videosRes.value as any)?.data ?? videosRes.value;
          if (Array.isArray(data)) {
            // Sort by date desc
            const sorted = [...data].sort((a: any, b: any) =>
              new Date(b.createdAt || b.uploadedAt).getTime() - new Date(a.createdAt || a.uploadedAt).getTime()
            );
            setAllVideos(sorted.map(mapVideo));
          }
        }

        // Channels
        if (channelsRes.status === 'fulfilled') {
          const data = (channelsRes.value as any)?.data ?? channelsRes.value;
          if (Array.isArray(data)) {
            // Sort by subscribers desc
            const sorted = [...data].map(mapChannel).sort((a, b) => (b.channelSubscribers || 0) - (a.channelSubscribers || 0));
            setChannels(sorted);
          }
        }

        // Subscriptions
        if (subsRes.status === 'fulfilled') {
          const data = (subsRes.value as any)?.data ?? subsRes.value;
          if (Array.isArray(data)) {
            setSubscriptions(data.map((s: any) => s.channelID ?? s.id));
          }
        }

        // Playlists
        if (playlistsRes.status === 'fulfilled') {
          const data = (playlistsRes.value as any)?.data ?? playlistsRes.value;
          if (Array.isArray(data)) {
            setAllPlaylists(data);
          }
        }

      } catch (err) {
        console.error("Home data load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtering
  const filteredVideos = useMemo(() => {
    if (activeTag === 'All') return allVideos;
    return allVideos.filter((video) =>
      `${video.title} ${video.description ?? ''}`.toLowerCase().includes(activeTag.toLowerCase())
    );
  }, [activeTag, allVideos]);

  const subscribedVideos = useMemo(() => {
    return filteredVideos.filter(v => v.channelId && subscriptions.includes(v.channelId));
  }, [filteredVideos, subscriptions]);

  // Playlist Priority Logic
  const prioritizedPlaylists = useMemo(() => {
    // 1. Playlists from subscribed channels
    const subscribed = allPlaylists.filter((p: any) => {
      const pChannelId = p.channelId || p.channelID || p.user?.userID; // heuristic
      return pChannelId && subscriptions.includes(pChannelId);
    });

    // 2. All other public playlists
    const others = allPlaylists.filter((p: any) => {
      const pChannelId = p.channelId || p.channelID || p.user?.userID;
      return !pChannelId || !subscriptions.includes(pChannelId);
    });

    return [...subscribed, ...others];
  }, [allPlaylists, subscriptions]);


  // Feed Generation Algorithm
  const feedSections = useMemo(() => {
    const sections: FeedSection[] = [];
    if (activeTag !== 'All') {
      // Simple View for Tags
      sections.push({ id: 'filtered', type: 'videos', title: `Result for ${activeTag}`, data: filteredVideos });
      return sections;
    }

    let vidIdx = 0;
    let chanIdx = 0;
    let subVidIdx = 0;
    let playIdx = 0;

    const VIDEO_BATCH = VIDEO_ROW_SIZE * 2; // 2 rows
    const CHANNEL_BATCH = CHANNEL_ROW_SIZE * 1; // 1 row
    const SUB_VIDEO_BATCH = VIDEO_ROW_SIZE * 2; // 2 rows
    const PLAYLIST_BATCH = PLAYLIST_ROW_SIZE * 1; // 1 row

    let cycle = 0;
    let hasData = true;

    while (hasData) {
      let sectionAdded = false;

      // 1. New Coming Videos (2 rows)
      if (vidIdx < filteredVideos.length) {
        const chunk = filteredVideos.slice(vidIdx, vidIdx + VIDEO_BATCH);
        if (chunk.length > 0) {
          sections.push({
            id: `new-${cycle}`,
            type: 'videos',
            title: cycle === 0 ? 'New Videos' : 'More Videos',
            data: chunk
          });
          vidIdx += VIDEO_BATCH;
          sectionAdded = true;
        }
      }

      // 2. Top Channels (1 row)
      if (chanIdx < channels.length) {
        const chunk = channels.slice(chanIdx, chanIdx + CHANNEL_BATCH);
        if (chunk.length > 0) {
          sections.push({
            id: `channels-${cycle}`,
            type: 'channels',
            title: cycle === 0 ? 'Top Channels' : 'Recommended Channels',
            data: chunk
          });
          chanIdx += CHANNEL_BATCH;
          sectionAdded = true;
        }
      }

      // 3. Subscribed Videos (2 rows)
      // Only show if we have subscriptions
      if (subscriptions.length > 0 && subVidIdx < subscribedVideos.length) {
        const chunk = subscribedVideos.slice(subVidIdx, subVidIdx + SUB_VIDEO_BATCH);
        if (chunk.length > 0) {
          sections.push({
            id: `subs-${cycle}`,
            type: 'subscribed-videos',
            title: 'From Your Subscriptions',
            data: chunk
          });
          subVidIdx += SUB_VIDEO_BATCH;
          sectionAdded = true;
        }
      }

      // 4. Playlists (1 row) - Using Prioritized List
      if (playIdx < prioritizedPlaylists.length) {
        const chunk = prioritizedPlaylists.slice(playIdx, playIdx + PLAYLIST_BATCH);
        if (chunk.length > 0) {
          sections.push({
            id: `playlists-${cycle}`,
            type: 'playlists',
            title: 'Playlists',
            data: chunk
          });
          playIdx += PLAYLIST_BATCH;
          sectionAdded = true;
        }
      }

      if (!sectionAdded) hasData = false;
      cycle++;
    }

    return sections;
  }, [filteredVideos, channels, subscribedVideos, prioritizedPlaylists, activeTag, subscriptions]);

  const renderSection = (section: FeedSection) => {
    switch (section.type) {
      case 'videos':
      case 'subscribed-videos':
        return (
          <div key={section.id} className="feed-section" style={{ marginBottom: 32 }}>
            {/* Title removed as requested */}
            {/* <h3 className="section-title">{section.title}</h3> */}
            <div className="video-grid">
              {section.data.map(v => <VideoCard key={v.id} video={v} />)}
            </div>
          </div>
        );
      case 'channels':
        return (
          <div key={section.id} className="feed-section" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
              {section.data.map(c => (
                <div key={c.id} style={{ minWidth: 160, flex: '0 0 auto' }}>
                  <ChannelCard channel={c} />
                </div>
              ))}
            </div>
          </div>
        );
      case 'playlists':
        return (
          <div key={section.id} className="feed-section" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
              {section.data.map((p: any) => (
                <div key={p.id || p.pID} style={{ minWidth: 380, flex: '0 0 auto' }}>
                  <PlaylistCard playlist={p} />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main className={`home-main ${!isSidebarOpen ? 'expanded' : ''}`}>
        <CategoryTags tags={tags} activeTag={activeTag} onTagChange={setActiveTag} />

        {loading ? (
          <div className="loading">Loading feed...</div>
        ) : (
          <div className="home-feed">
            {feedSections.map(renderSection)}
            {!feedSections.length && <div className="no-results">No content available.</div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
