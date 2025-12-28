import { useEffect, useState } from 'react';
import { useUI } from '../contexts/UIContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoCard, { type Video } from '../components/common/VideoCard';
import { videosApi } from '../services/videosApi';
import type { Video as ApiVideo } from '../types/video';
import '../styles/layout.css';
import '../styles/video-grid.css';

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
    publicID: video.publicID,
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
    channelPublicID: video.channelPublicID ?? channelObj?.publicID,
  };
};

export default function Trending() {
  const { isSidebarOpen } = useUI();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await videosApi.getAll();
        const data = (res as any)?.data ?? res;
        const items: ApiVideo[] = Array.isArray(data) ? data : [];
        // Sort by views descending; fallback to 0
        const sorted = [...items].sort((a, b) => (b.views || 0) - (a.views || 0));

        if (mounted) {
          const normalized = sorted.map((v, idx) => mapVideo(v, idx));
          setVideos(normalized);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load trending');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main className={`home-main ${!isSidebarOpen ? 'expanded' : ''}`}>
        <div style={{ padding: '0 24px' }}>
          <h2 style={{ marginBottom: 20, fontSize: '24px' }}>Trending</h2>

          {loading ? (
            <div className="loading">Loading trending videos...</div>
          ) : error ? (
            <div style={{ color: 'crimson' }}>{error}</div>
          ) : videos.length === 0 ? (
            <div className="no-results">No trending videos found.</div>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
