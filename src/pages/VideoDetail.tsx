import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { FaEye, FaHeart, FaTag, FaThumbsUp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoCard from '../components/common/VideoCard';
import VideoPlayer from '../components/player/VideoPlayer';
import { videosApi, type VideoStats } from '../services/videosApi';
import { tagsApi, type Tag } from '../services/tagsApi';
import { playlistsApi, type PlaylistDetail } from '../services/playlistsApi';
import { authApi } from '../services/authApi';
import type { Video } from '../types/video';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';
import '../styles/video-detail.css';

const CollapsibleText: React.FC<{ text: string }> = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const maxChars = 220;
  const isLong = text && text.length > maxChars;
  const display = expanded || !isLong ? text : text.slice(0, maxChars) + '...';
  return (
    <div className="collapsible-text">
      <p>{display}</p>
      {isLong && (
        <button className="link" onClick={() => setExpanded((e) => !e)}>
          {expanded ? '▲ Show less' : '▼ Show more'}
        </button>
      )}
    </div>
  );
};

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

interface CommentItem {
  id?: number;
  userID: number;
  vidID: number;
  description: string;
  createdAt?: string;
  userName?: string;
}

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const videoId = Number(id);
  const { user } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [stats, setStats] = useState<VideoStats | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [relatedByChannel, setRelatedByChannel] = useState<Video[]>([]);
  const [relatedByTags, setRelatedByTags] = useState<Video[]>([]);
  const [sidebarVideos, setSidebarVideos] = useState<Video[]>([]);
  const [userNames, setUserNames] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!videoId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [videoRes, statsRes, commentsRes, tagsRes] = await Promise.allSettled([
          videosApi.getById(videoId),
          videosApi.getStats(videoId),
          videosApi.getComments(videoId),
          tagsApi.getVideoTags(videoId),
        ]);

        if (videoRes.status === 'fulfilled') {
          const rawData = unwrap<any>(videoRes.value);
          console.log('🎥 Raw video data from backend:', rawData);
          if (rawData) {
            const mappedVideo: Video = {
              id: Number(rawData.vidID ?? rawData.id),
              title: rawData.title ?? 'Untitled',
              description: rawData.description,
              thumbnail: rawData.images?.[0]?.imgURL || rawData.thumbnail,
              duration: rawData.duration ?? 0,
              channelName: rawData.channel?.channelName ?? rawData.channelName ?? 'Unknown',
              channelId: Number(rawData.channelID ?? rawData.channel?.channelID ?? rawData.channelId),
              channelImage: rawData.channel?.channelImage ?? rawData.channelImage,
              channelDescription: rawData.channel?.channelDescription ?? rawData.channelDescription,
              channelSubscribers: Number(rawData.channel?.channelSubscribers ?? rawData.channelSubscribers ?? 0),
              views: Number(rawData.views ?? 0),
              uploadedAt: rawData.createdAt ?? rawData.uploadedAt ?? new Date().toISOString(),
              url: rawData.playbackURL || rawData.cloudflarePlaybackURL || rawData.s3KeyProcessed || rawData.url,
              createdAt: rawData.createdAt,
            };
            console.log('✅ Mapped video:', mappedVideo);
            console.log('📹 Video URL:', mappedVideo.url);
            setVideo(mappedVideo);
            // Initialize subscription state against mapped channel
            if (user && mappedVideo.channelId) {
              try {
                const subsRes = await (await import('../services/subscriptionsApi')).subscriptionsApi.mine();
                const subs = unwrap<any[]>(subsRes) || [];
                const found = subs.some((c: any) => Number(c.channelID ?? c.id) === Number(mappedVideo.channelId));
                setIsSubscribed(found);
              } catch (_) {}
            }
          } else {
            console.log('❌ No video data received');
            setVideo(null);
          }
        } else {
          console.error('❌ Video fetch failed:', videoRes.reason);
          throw videoRes.reason;
        }

        if (statsRes.status === 'fulfilled') {
          const raw = unwrap<any>(statsRes.value);
          const normalized: VideoStats = {
            vidID: Number(raw?.vidID ?? videoId),
            views: Number(raw?.viewsCount ?? raw?.views ?? 0),
            likes: Number(raw?.likesCount ?? raw?.likes ?? 0),
          };
          setStats(normalized);
        }

        if (commentsRes.status === 'fulfilled') {
          const data = unwrap<CommentItem[] | undefined>(commentsRes.value) || [];
          const list = Array.isArray(data) ? data : [];
          // Fetch commenter names (unique ids)
          const ids = Array.from(new Set(list.map((c) => c.userID).filter(Boolean)));
          if (ids.length) {
            const results = await Promise.allSettled(ids.map((uid) => authApi.getUser(uid)));
            const nameMap: Record<number, string> = {};
            results.forEach((r, idx) => {
              const uid = ids[idx];
              if (r.status === 'fulfilled') {
                const u = unwrap<{ id?: number; name?: string }>(r.value);
                if (u && typeof u === 'object' && u.name) nameMap[uid] = u.name;
              }
            });
            setUserNames((prev) => ({ ...prev, ...nameMap }));
            // Enrich comments with userName
            const enriched = list.map((c) => ({
              ...c,
              userName: nameMap[c.userID] || c.userName,
            }));
            setComments(enriched);
          } else {
            setComments(list);
          }
        }

        if (tagsRes.status === 'fulfilled') {
          const data = unwrap<Tag[] | undefined>(tagsRes.value) || [];
          setTags(Array.isArray(data) ? data : []);
        }

        // Fire-and-forget view increment; optimistically bump UI
        videosApi.incrementViews(videoId)
          .then(() => setStats((prev) => (prev ? { ...prev, views: (prev.views || 0) + 1 } : prev)))
          .catch((err) => console.warn('View increment failed', err));

        if (user) {
          const likedRes = await videosApi.hasLiked(user.id, videoId);
          const likedObj = unwrap<any>(likedRes);
          setIsLiked(Boolean(likedObj?.hasLiked));
        }
        
      } catch (error) {
        toast.error('Failed to load video');
        console.error('Video detail error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [videoId, user]);

  // Helper to normalize any raw video-like object into VideoCard shape
  const mapRawToVideo = (raw: any, index: number = 0): Video => {
    const channelObj = raw.channel || raw.Channel || raw.channelInfo;
    const channelId = raw.channelId ?? raw.channelID ?? channelObj?.channelID ?? channelObj?.id;
    const channelName =
      raw.channelName ||
      channelObj?.channelName ||
      channelObj?.name ||
      channelObj?.user?.userName ||
      'Unknown channel';
    const channelImage = raw.channelImage || channelObj?.channelImage || channelObj?.image;

    const rawId = raw.vidID ?? raw.videoID ?? raw.id;
    const parsedId = typeof rawId === 'string' ? parseInt(rawId, 10) : Number(rawId);

    return {
      id: Number.isFinite(parsedId) && !Number.isNaN(parsedId) ? parsedId : index + 1,
      title: raw.title ?? 'Untitled video',
      description: raw.description,
      thumbnail: raw.images?.[0]?.imgURL || raw.thumbnail,
      duration: Number(raw.duration ?? 0),
      channelName,
      channelImage,
      views: Number(raw.views ?? 0),
      uploadedAt: raw.uploadedAt || raw.createdAt || new Date().toISOString(),
      badge: raw.badge,
      channelId: Number(channelId) || undefined,
    };
  };

  // Fetch sidebar videos based on context: playlist -> channel/tag -> all
  useEffect(() => {
    const fetchSidebar = async () => {
      if (!video) return;
      try {
        const search = new URLSearchParams(location.search);
        const playlistParam = search.get('playlist');
        const playlistContextId = playlistParam ? Number(playlistParam) : undefined;

        // If playing from a playlist, show videos from that playlist
        if (playlistContextId) {
          const resp = await playlistsApi.getById(playlistContextId);
          const data = unwrap<PlaylistDetail>(resp);
          const videos = (data.videos || [])
            .map((item, index) => mapRawToVideo(item.video || item, index))
            .filter(v => v.id !== video.id);
          // Preserve playlist context in links by appending ?playlist
          setSidebarVideos(videos);
          return;
        }

        // Else assemble from channel (up to 3) + one from tag
        const tasks: Promise<any>[] = [];
        if (video.channelId) tasks.push(videosApi.getByChannel(video.channelId));
        const firstTagId = tags[0]?.id as any;
        if (firstTagId) tasks.push(videosApi.getByTag(Number(firstTagId)));

        const results = await Promise.allSettled(tasks);
        const rawChannel = results[0]?.status === 'fulfilled' ? unwrap<any[]>(results[0].value) : [];
        const rawTag = results[1]?.status === 'fulfilled' ? unwrap<any[]>(results[1].value) : [];

        const channelList = rawChannel.map((r, i) => mapRawToVideo(r, i));
        const tagList = rawTag.map((r, i) => mapRawToVideo(r, i));

        const filteredChannel = channelList.filter(v => v.id !== video.id);
        const filteredTag = tagList.filter(v => v.id !== video.id);

        const combined: Video[] = [];
        combined.push(...filteredChannel.slice(0, 3));
        if (filteredTag.length) combined.push(filteredTag[0]);

        // If exhausted, show all videos
        if (combined.length === 0) {
          const allResp = await videosApi.getAll();
          const rawAll = unwrap<any[]>(allResp);
          const allList = rawAll.map((r, i) => mapRawToVideo(r, i)).filter(v => v.id !== video.id);
          setSidebarVideos(allList);
        } else {
          setSidebarVideos(combined);
        }
      } catch (e) {
        console.warn('Failed to load sidebar videos', e);
      }
    };
    fetchSidebar();
  }, [video, tags, location.search]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like');
      return;
    }
    try {
      if (isLiked) {
        // Unlike (remove user like) and decrement stats
        await videosApi.unlike(user.id, videoId);
        await videosApi.decrementLikes(videoId);
        setIsLiked(false);
        setStats((prev) => (prev ? { ...prev, likes: Math.max(prev.likes - 1, 0) } : prev));
      } else {
        // Like (create user like) and increment stats
        await videosApi.like(user.id, videoId);
        await videosApi.incrementLikes(videoId);
        setIsLiked(true);
        setStats((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : prev));
      }
    } catch (error) {
      toast.error('Unable to update like');
      console.error(error);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error('Please log in to comment');
      return;
    }
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const res = await videosApi.addComment({
        userID: user.id,
        vidID: videoId,
        description: commentText.trim(),
      });
      const newComment = unwrap<CommentItem | null>(res);
      if (newComment) {
        const enriched: CommentItem = { ...newComment, userName: user.name };
        setUserNames((prev) => ({ ...prev, [user.id]: user.name }));
        setComments((prev) => [enriched, ...prev]);
        setCommentText('');
      }
    } catch (error) {
      toast.error('Failed to add comment');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const viewCount = useMemo(() => stats?.views ?? video?.views ?? 0, [stats, video]);
  const likeCount = useMemo(() => stats?.likes ?? 0, [stats]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <div className="app-container">
      <Header />
      <Sidebar collapsed={true} />

      <main className="video-detail-page">
        {loading ? (
          <div className="loading">Loading video...</div>
        ) : !video ? (
          <div className="no-results">Video not found.</div>
        ) : (
          <div className="video-detail-layout">
            <div>
              <VideoPlayer src={video.url} poster={video.thumbnail} title={video.title} />

              <div className="video-meta">
                <div className="video-meta-left">
                  <h1>{video.title}</h1>
                  <div className="stats-row">
                    <span><FaEye /> {viewCount} views</span>
                    <span><FaHeart /> {likeCount} likes</span>
                  </div>
                <div className="actions">
                  {user && (
                    <button 
                      className={`like-btn ${isLiked ? 'liked' : ''}`} 
                      onClick={handleLike}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <FaThumbsUp />
                    </button>
                  )}
                  {user && video.channelId && (
                    <button
                      className={`subscribe-btn ${isSubscribed ? 'subscribed' : ''}`}
                      onClick={async () => {
                        if (!user || !video.channelId) {
                          toast.error('Log in to subscribe');
                          return;
                        }
                        try {
                          if (isSubscribed) {
                            await (await import('../services/channelsApi')).channelsApi.unsubscribe(video.channelId, user.id);
                            setIsSubscribed(false);
                          } else {
                            await (await import('../services/channelsApi')).channelsApi.subscribe(video.channelId, user.id);
                            setIsSubscribed(true);
                          }
                        } catch (e) {
                          toast.error('Subscription action failed');
                          console.error(e);
                        }
                      }}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  )}
                </div>

                {tags.length > 0 && (
                  <div className="tag-list">
                    {tags.map((tag) => (
                      <span key={tag.id || tag.name} className="tag-chip"><FaTag /> {tag.name}</span>
                    ))}
                  </div>
                )}

                  {/* Collapsible description below actions */}
                  <div className="meta-section">
                    <div className="meta-header">
                      <h3>Description</h3>
                    </div>
                    <CollapsibleText text={video.description || 'No description provided.'} />
                  </div>
                </div>

                <div className="video-meta-right">
                  {video.channelId && (
                    <a href={`/channel/${video.channelId}`} className="channel-card">
                      {video.channelImage ? (
                        <img src={video.channelImage} alt={video.channelName} className="channel-avatar" />
                      ) : (
                        <div className="channel-avatar-placeholder">{video.channelName.charAt(0).toUpperCase()}</div>
                      )}
                      <div className="channel-info">
                        <h4>{video.channelName}</h4>
                        {typeof video.channelSubscribers === 'number' && (
                          <p>{video.channelSubscribers} subscribers</p>
                        )}
                      </div>
                    </a>
                  )}
                </div>
              </div>

              <div className="comments-panel">
                <h3>Comments ({comments.length})</h3>
                <div className="comment-form">
                  {user ? (
                    <>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment"
                      />
                      <button onClick={handleAddComment} disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </>
                  ) : (
                    <p>Please log in to comment.</p>
                  )}
                </div>

                {comments.map((comment) => (
                  <div key={comment.id ?? `${comment.userID}-${comment.description}`} className="comment-item">
                    <div className="comment-meta">{comment.userName || userNames[comment.userID] || `User ${comment.userID}`}</div>
                    <div className="comment-body">{comment.description}</div>
                  </div>
                ))}
                {!comments.length && <div className="no-results">No comments yet.</div>}
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-videos">
                {sidebarVideos.map((v, idx) => (
                  <VideoCard key={v.id || idx} video={v} />
                ))}
                {!sidebarVideos.length && <div className="no-results">No videos found.</div>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoDetail;
