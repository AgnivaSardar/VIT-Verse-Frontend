import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoCard, { type Video } from '../components/common/VideoCard';
import { videosApi } from '../services/videosApi';
import type { Video as ApiVideo } from '../types/video';
import '../styles/layout.css';
import '../styles/video-grid.css';

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    }
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await videosApi.getAll();
      const data = unwrap<ApiVideo[] | undefined>(response) || [];
      const normalized = (data || []).map((video) => ({
        id: video.id ?? 0,
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
      }));

      const filtered = normalized.filter((video) =>
        `${video.title} ${video.channelName} ${video.description ?? ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main>
        <div className="search-header">
          <h2>
            <FaSearch /> Search results for "{query}"
          </h2>
        </div>

        {loading ? (
          <div className="loading">Searching...</div>
        ) : results.length > 0 ? (
          <div className="video-grid">
            {results.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No videos found matching your search.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
