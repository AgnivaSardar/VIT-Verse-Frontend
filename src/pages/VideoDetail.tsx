import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaEye, FaHeart, FaTag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import VideoPlayer from '../components/player/VideoPlayer';
import { videosApi, type VideoStats } from '../services/videosApi';
import { tagsApi, type Tag } from '../services/tagsApi';
import type { Video } from '../types/video';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';
import '../styles/video-detail.css';

const unwrap = <T>(resp: any): T => (resp && typeof resp === 'object' && 'data' in resp ? (resp as any).data : resp);

interface CommentItem {
  id?: number;
  userID: number;
  vidID: number;
  description: string;
  createdAt?: string;
}

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
          const data = unwrap<Video | undefined>(videoRes.value);
          setVideo(data);
        } else {
          throw videoRes.reason;
        }

        if (statsRes.status === 'fulfilled') {
          const data = unwrap<VideoStats | undefined>(statsRes.value);
          setStats(data ?? null);
        }

        if (commentsRes.status === 'fulfilled') {
          const data = unwrap<CommentItem[] | undefined>(commentsRes.value) || [];
          setComments(Array.isArray(data) ? data : []);
        }

        if (tagsRes.status === 'fulfilled') {
          const data = unwrap<Tag[] | undefined>(tagsRes.value) || [];
          setTags(Array.isArray(data) ? data : []);
        }

        videosApi.incrementViews(videoId).catch((err) => console.warn('View increment failed', err));

        if (user) {
          const likedRes = await videosApi.hasLiked(user.id, videoId);
          const liked = unwrap<boolean | undefined>(likedRes);
          setIsLiked(Boolean(liked));
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

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like');
      return;
    }
    try {
      if (isLiked) {
        await videosApi.decrementLikes(videoId);
        setIsLiked(false);
        setStats((prev) => (prev ? { ...prev, likes: Math.max(prev.likes - 1, 0) } : prev));
      } else {
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
        setComments((prev) => [newComment, ...prev]);
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
          <div className="video-detail-layout">
            <div>
              <VideoPlayer src={video.url} poster={video.thumbnail} title={video.title} />

              <div className="video-meta">
                <h1>{video.title}</h1>
                <div className="stats-row">
                  <span><FaEye /> {viewCount} views</span>
                  <span><FaHeart /> {likeCount} likes</span>
                </div>
                <div className="actions">
                  <button className={isLiked ? 'primary' : ''} onClick={handleLike}>
                    {isLiked ? 'Liked' : 'Like'}
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="tag-list">
                    {tags.map((tag) => (
                      <span key={tag.id || tag.name} className="tag-chip"><FaTag /> {tag.name}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="video-detail-grid">
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
                      <div className="comment-meta">User {comment.userID}</div>
                      <div className="comment-body">{comment.description}</div>
                    </div>
                  ))}
                  {!comments.length && <div className="no-results">No comments yet.</div>}
                </div>

                <div className="about-panel">
                  <h3>About</h3>
                  <p>{video.description || 'No description provided.'}</p>
                  <p>Uploaded: {video.uploadedAt || video.createdAt || 'Recently'}</p>
                  <p>Channel: {video.channelName || 'Unknown channel'}</p>
                </div>
              </div>
            </div>

            <div className="sidebar-card">
              <h4>Channel</h4>
              <p>{video.channelName || 'Unknown channel'}</p>
              {video.badge && <p>Badge: {video.badge}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default VideoDetail;
