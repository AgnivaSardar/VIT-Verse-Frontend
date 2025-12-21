import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import CategoryTags from '../components/common/CategoryTags';
import VideoCard, { type Video } from '../components/common/VideoCard';
import { videosApi } from '../services/videosApi';
import { tagsApi, type Tag } from '../services/tagsApi';
import type { Video as ApiVideo } from '../types/video';
import '../styles/layout.css';
import '../styles/video-grid.css';

const mapVideo = (video: ApiVideo, index: number): Video => ({
  id: video.id ?? (video as any)?.videoID ?? index,
  title: video.title ?? 'Untitled video',
  description: video.description,
  thumbnail: video.thumbnail,
  duration: video.duration ?? 0,
  channelName: video.channelName ?? 'Unknown channel',
  channelImage: video.channelImage,
  views: video.views ?? 0,
  uploadedAt: video.uploadedAt || video.createdAt || 'Just now',
  badge: video.badge,
  channelId: video.channelId ?? (video as any)?.channelID,
});

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

const Home: React.FC = () => {
  const [activeTag, setActiveTag] = useState('All');
  const [tags, setTags] = useState<string[]>(['All']);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await tagsApi.getPopular();
        const tagData = unwrap<Tag[] | undefined>(response) || [];
        if (Array.isArray(tagData) && tagData.length > 0) {
          setTags(['All', ...tagData.map((tag) => tag.name)]);
        }
      } catch (error) {
        // silently fallback to default tags
        console.error('Failed to load tags', error);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await videosApi.getAll();
        console.log('Videos API response:', response);
        const data = unwrap<ApiVideo[] | undefined>(response) || [];
        console.log('Unwrapped data:', data);
        const normalized = Array.isArray(data) ? data.map((v, idx) => mapVideo(v, idx)) : [];
        console.log('Normalized videos:', normalized);
        setVideos(normalized);
      } catch (error) {
        console.error('Video load error:', error);
        toast.error('Failed to load videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [activeTag]);

  const filteredVideos = useMemo(() => {
    if (activeTag === 'All') return videos;
    return videos.filter((video) =>
      `${video.title} ${video.description ?? ''}`
        .toLowerCase()
        .includes(activeTag.toLowerCase())
    );
  }, [activeTag, videos]);

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main>
        <CategoryTags tags={tags} activeTag={activeTag} onTagChange={setActiveTag} />

        {loading ? (
          <div className="loading">Loading videos...</div>
        ) : (
          <div className="video-grid">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
            {!filteredVideos.length && <div className="no-results">No videos found.</div>}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
