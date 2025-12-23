import { useEffect, useState } from 'react';
import { videosApi } from '../services/videosApi';
import type { Video } from '../types/video';

export default function Trending() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await videosApi.getAll();
        const data = (res as any)?.data ?? res;
        const items: Video[] = Array.isArray(data) ? data : [];
        // Sort by views descending; fallback to 0
        const sorted = [...items].sort((a, b) => (b.views || 0) - (a.views || 0));
        if (mounted) setVideos(sorted);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load trending');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading trending…</div>;
  if (error) return <div style={{ padding: 16, color: 'crimson' }}>{error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Trending</h2>
      {videos.length === 0 ? (
        <div>No videos found.</div>
      ) : (
        <div className="grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {videos.map(v => (
            <a key={v.vidID || v.id} href={`/video/${v.vidID || v.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
                {v.thumbnail && (
                  <img src={v.thumbnail} alt={v.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
                )}
                <div style={{ padding: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{(v.views || 0).toLocaleString()} views</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
