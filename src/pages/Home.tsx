import React, { useState, useEffect, useMemo } from 'react';
import { useUI } from '../contexts/UIContext';
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
import '../styles/search.css';

const mapVideo = (video: any, index: number): Video => {
  const channelObj = video.channel || video.Channel || video.channelInfo;
  const channelId = video.channelId ?? video.channelID ?? channelObj?.channelID ?? channelObj?.id;
  const channelName =
    video.channelName ||
    channelObj?.channelName ||
    channelObj?.name ||
    channelObj?.user?.userName ||
    'Unknown channel';
  const channelImage = video.channelImage || channelObj?.channelImage || channelObj?.image;

  // Prefer backend primary key `vidID` and normalize to number
  const rawId = video.vidID ?? video.videoID ?? video.id;
  const parsedId =
    typeof rawId === 'string' ? parseInt(rawId, 10) : Number(rawId);

  const thumb = video.thumbnail || video.images?.[0]?.imgURL;

  return {
    // Avoid 0 by falling back to index + 1 only when missing
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

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}



const Home: React.FC = () => {
  const { isSidebarOpen } = useUI();
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

      <main className={`home-main ${!isSidebarOpen ? 'expanded' : ''}`}>
        <CategoryTags tags={tags} activeTag={activeTag} onTagChange={setActiveTag} />


        {/* All/Filtered Videos */}
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
