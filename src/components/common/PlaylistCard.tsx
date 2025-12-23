import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { PlaylistDetail } from '../../services/playlistsApi';
import '../../styles/video-card.css';
import '../../styles/playlist-card.css';

export interface PlaylistCardProps {
  playlist: PlaylistDetail;
  channelName?: string;
}

function getPlaylistId(playlist: PlaylistDetail): number {
  return Number(playlist.pID || playlist.id);
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({
  playlist,
  channelName,
}) => {
  const navigate = useNavigate();
  const playlistId = getPlaylistId(playlist);
  const firstVideo = playlist.videos?.[0];
  const videoCount = playlist.videos?.length || 0;
  const channelId =
    (playlist as any).channelId ||
    (playlist as any).channelID ||
    (playlist.user as any)?.userID ||
    (firstVideo as any)?.channelId;
  
  const getThumbnailUrl = () => {
    if (firstVideo?.video?.thumbnail) {
      return firstVideo.video.thumbnail;
    }
    // Greyscale palette fallback
    const colors = ['#0f172a', '#111827', '#1f2937', '#2d3748', '#374151'];
    const color = colors[playlistId % colors.length];
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='160'%3E%3Crect fill='${color.replace('#', '%23')}' width='280' height='160'/%3E%3C/svg%3E`;
  };

  const formatCreatedDate = () => {
    if (!playlist.createdAt) return '';
    const date = new Date(playlist.createdAt);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const displayChannelName = channelName || playlist.user?.userName || 'Playlist';

  const handleChannelClick = (e: React.MouseEvent) => {
    if (!channelId) return;
    e.preventDefault();
    e.stopPropagation();
    navigate(`/channel/${channelId}`);
  };

  return (
    <Link
      to={`/playlists/${playlistId}`}
      className="video-card-link"
    >
      <div className="video-card">
        <div className="thumbnail" style={{ backgroundImage: `url(${getThumbnailUrl()})` }}>
          <span className="duration playlist-count">{videoCount} video{videoCount === 1 ? '' : 's'}</span>
        </div>
        <div className="video-info">
          <div className="details">
            <h3>{playlist.name}</h3>
            <p>
              {displayChannelName}
              {playlist.isPremium && <span className="badge">Premium</span>}
              {!playlist.isPublic && <span className="badge">Private</span>}
            </p>
            <p>{formatCreatedDate()}</p>
          </div>
          <img
            src={`https://ui-avatars.com/api/?name=${displayChannelName}&background=1f2937&color=e5e7eb`}
            className="chan-img"
            alt={displayChannelName}
            onClick={handleChannelClick}
            style={{ cursor: channelId ? 'pointer' : 'default' }}
          />
        </div>
      </div>
    </Link>
  );
};

export default PlaylistCard;
