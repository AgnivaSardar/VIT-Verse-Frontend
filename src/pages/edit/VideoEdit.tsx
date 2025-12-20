import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { videosApi } from '../../services/videosApi';
import type { Video } from '../../types/video';
import '../../styles/layout.css';
import '../../styles/video-detail.css';

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

const VideoEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const videoId = Number(id);
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId) return;
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const response = await videosApi.getById(videoId);
        const data = unwrap<Video | undefined>(response);
        setVideo(data ?? null);
      } catch (error) {
        toast.error('Failed to load video');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main className="video-detail-page">
        {loading ? (
          <div className="loading">Loading video...</div>
        ) : !video ? (
          <div className="no-results">Video not found.</div>
        ) : (
          <div className="sidebar-card">
            <h1>Video Details</h1>
            <p>Title: {video.title}</p>
            <p>Description: {video.description || 'No description'}</p>
            <p>Channel: {video.channelName}</p>
            <p>Note: Update endpoint not provided; editing is read-only.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoEdit;
