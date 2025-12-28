import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoCard, { type Video } from '../components/common/VideoCard';
import ChannelCard from '../components/common/ChannelCard';
import PlaylistCard from '../components/common/PlaylistCard';
import { videosApi } from '../services/videosApi';
import { playlistsApi, type PlaylistDetail } from '../services/playlistsApi';
import { channelsApi } from '../services/channelsApi';
import type { Video as ApiVideo } from '../types/video';
import type { Channel } from '../types';
import '../styles/layout.css';
import '../styles/video-grid.css';
import '../styles/search.css';

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [videoResults, setVideoResults] = useState<Video[]>([]);
  const [playlistResults, setPlaylistResults] = useState<PlaylistDetail[]>([]);
  type ChannelResult = Channel & { channelImage?: string; image?: string; channelThumbnail?: string; subscribers?: number };
  const [channelResults, setChannelResults] = useState<ChannelResult[]>([]);
  const [loading, setLoading] = useState(false);

  const query = searchParams.get('q') || '';

  const handleSearch = async () => {
    setLoading(true);
    try {
      const lowerQuery = query.toLowerCase();
      // Search videos
      const videosResponse = await videosApi.getAll();
      const videosData = unwrap<ApiVideo[] | undefined>(videosResponse) || [];
      const normalized = (videosData || []).map((video: any) => {
        const channelObj = video.channel || video.Channel || video.channelInfo;
        return {
          id: Number(video.vidID ?? video.videoID ?? video.id ?? 0),
          publicID: video.publicID,
          title: video.title ?? 'Untitled video',
          description: video.description,
          thumbnail: video.thumbnail,
          duration: video.duration ?? 0,
          channelName:
            video.channelName ||
            channelObj?.channelName ||
            channelObj?.name ||
            channelObj?.user?.userName ||
            'Unknown channel',
          channelImage: video.channelImage || channelObj?.channelImage || channelObj?.image,
          views: video.views ?? 0,
          uploadedAt: video.uploadedAt || video.createdAt || 'Just now',
          badge: video.badge,
          channelId: video.channelId ?? video.channelID ?? channelObj?.channelID ?? channelObj?.id,
          channelPublicID: video.channelPublicID ?? channelObj?.publicID,
        } as Video;
      });

      const filteredVideos = normalized.filter((video) =>
        `${video.title} ${video.channelName} ${video.description ?? ''}`
          .toLowerCase()
          .includes(lowerQuery)
      );
      setVideoResults(filteredVideos);

      // Search channels
      try {
        const channelsResponse = await channelsApi.getAll();
        const channelsData = unwrap<any[] | undefined>(channelsResponse) || [];
        const mappedChannels: ChannelResult[] = channelsData.map((ch) => ({
          channelID: ch.channelID ?? ch.id,
          publicID: ch.publicID,
          id: ch.publicID || ch.id || ch.channelID,
          userID: ch.userID,
          channelName: ch.channelName ?? ch.name ?? 'Channel',
          channelDescription: ch.channelDescription ?? ch.description ?? '',
          channelType: (ch.channelType as Channel['channelType']) ?? 'public',
          channelSubscribers: ch.channelSubscribers ?? ch.subscribers,
          subscribers: ch.subscribers ?? ch.channelSubscribers,
          isPremium: ch.isPremium,
          channelImage: ch.channelImage || ch.channelThumbnail || ch.image,
          channelThumbnail: ch.channelThumbnail,
          image: ch.image || ch.channelImage,
        }));

        const filteredChannels = mappedChannels.filter((channel) =>
          `${channel.channelName} ${channel.channelDescription}`
            .toLowerCase()
            .includes(lowerQuery)
        );

        setChannelResults(filteredChannels);
      } catch (error) {
        console.error('Channel search error:', error);
        setChannelResults([]);
      }

      // Search all public playlists (no authentication required)
      try {
        const playlistsResponse = await playlistsApi.getAll();
        const allPlaylists = unwrap<PlaylistDetail[] | undefined>(playlistsResponse) || [];

        const filteredPlaylists = allPlaylists.filter((playlist) =>
          `${playlist.name} ${playlist.description || ''}`
            .toLowerCase()
            .includes(lowerQuery)
        );

        setPlaylistResults(filteredPlaylists);
      } catch (error) {
        console.error('Playlist search error:', error);
        setPlaylistResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    } else {
      setVideoResults([]);
      setPlaylistResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasResults = videoResults.length > 0 || playlistResults.length > 0 || channelResults.length > 0;

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main className="search-page">
        {query && <p className="search-query">Results for "{query}"</p>}
        {loading ? (
          <div className="loading">Searching...</div>
        ) : hasResults ? (
          <>
            {/* Channels Section */}
            {channelResults.length > 0 && (
              <section className="search-section">
                <h2 className="section-title">Channels ({channelResults.length})</h2>
                <div className="channel-strip" role="list">
                  {channelResults.map((channel) => (
                    <ChannelCard
                      key={channel.channelID || channel.id}
                      channel={channel}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Playlists Section */}
            {playlistResults.length > 0 && (
              <section className="search-section">
                <h2 className="section-title">Playlists ({playlistResults.length})</h2>
                <div className="video-grid playlists-grid">
                  {playlistResults.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id || playlist.pID}
                      playlist={playlist}
                      channelName={playlist.user?.userName}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Videos Section */}
            {videoResults.length > 0 && (
              <section className="search-section">
                <h2 className="section-title">Videos ({videoResults.length})</h2>
                <div className="video-grid">
                  {videoResults.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : query ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No results</h3>
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>Start searching</h3>
          </div>
        )}
      </main>
    </div>
  );
};

export default Search;
