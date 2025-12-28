import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Channel } from '../../types';

type ChannelCardProps = {
  channel: Channel & {
    channelImage?: string;
    image?: string;
    subscribers?: number;
    channelSubscribers?: number;
    channelThumbnail?: string;
  };
};

const ChannelCard: React.FC<ChannelCardProps> = ({ channel }) => {
  const navigate = useNavigate();
  const id = channel.publicID || channel.channelID || channel.id || 0;
  const avatar = channel.channelImage || channel.channelThumbnail || channel.image;
  const avatarSrc = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.channelName || 'C')}&background=1f2937&color=e5e7eb`;
  const subs = channel.channelSubscribers ?? channel.subscribers;

  return (
    <button
      type="button"
      className="channel-card"
      onClick={() => navigate(`/channel/${id}`)}
      aria-label={`Open channel ${channel.channelName}`}
    >
      <img
        src={avatarSrc}
        className="channel-avatar"
        alt={channel.channelName}
      />
      <div className="channel-title" title={channel.channelName}>
        {channel.channelName}
      </div>
      <div className="channel-meta">
        {subs ? `${subs.toLocaleString()} subscribers` : channel.channelDescription || 'Channel'}
      </div>
    </button>
  );
};

export default ChannelCard;