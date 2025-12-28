import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/video-card.css';

export interface Video {
  id: number;
  publicID?: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration: number;
  channelName: string;
  channelImage?: string;
  views: number;
  uploadedAt: string;
  badge?: string;
  channelId?: number;
  channelPublicID?: string;
}

interface VideoCardProps {
  video: Video;
  // Optional override for destination URL (e.g., add query params)
  to?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, to }) => {
  const navigate = useNavigate();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const getThumbnailUrl = () => {
    if (video.thumbnail) {
      return video.thumbnail;
    }
    // Greyscale palette fallback when no thumbnail
    const colors = ['#0f172a', '#111827', '#1f2937', '#2d3748', '#374151'];
    const numericId = Number(video.id);
    const idx = Number.isFinite(numericId) ? Math.abs(numericId) % colors.length : 0;
    const color = colors[idx] || '#1f2937';
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='160'%3E%3Crect fill='${color.replace('#', '%23')}' width='280' height='160'/%3E%3C/svg%3E`;
  };

  const formatUploadedDate = (value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleChannelClick = (e: React.MouseEvent) => {
    const cid = video.channelPublicID || video.channelId;
    if (!cid) return;
    e.preventDefault();
    e.stopPropagation();
    navigate(`/channel/${cid}`);
  };

  const videoId = video.publicID || video.id;
  const href = to || `/video/${videoId}`;

  return (
    <Link to={href} className="video-card-link">
      <div className="video-card">
        <div className="thumbnail" style={{ backgroundImage: `url(${getThumbnailUrl()})` }}>
          <span className="duration">{formatDuration(video.duration)}</span>
        </div>
        <div className="video-info">
          <div className="details">
            <h3>{video.title}</h3>
            <p>
              {video.channelName}
              {video.badge && <span className="badge">{video.badge}</span>}
            </p>
            <p>{formatViews(video.views)} views • {formatUploadedDate(video.uploadedAt)}</p>
          </div>
          <button
            type="button"
            className="chan-img-btn"
            onClick={handleChannelClick}
            aria-label={`Go to ${video.channelName} channel`}
            disabled={!video.channelId}
          >
            <img
              src={
                video.channelImage ||
                `https://ui-avatars.com/api/?name=${video.channelName}&background=1f2937&color=e5e7eb`
              }
              className="chan-img"
              alt={video.channelName}
            />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
