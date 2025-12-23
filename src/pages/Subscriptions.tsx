import { useEffect, useState } from 'react';
import { subscriptionsApi } from '../services/subscriptionsApi';
import type { Channel } from '../types';

export default function Subscriptions() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await subscriptionsApi.mine();
        const raw = (res as any)?.data ?? res;
        const list: any[] = Array.isArray(raw) ? raw : [];
        const normalized: Channel[] = list.map((c) => ({
          ...c,
          id: (c as any).id ?? (c as any).channelID,
        }));
        if (mounted) setChannels(normalized);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load subscriptions');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading subscriptions…</div>;
  if (error) return <div style={{ padding: 16, color: 'crimson' }}>{error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 12 }}>Your Subscriptions</h2>
      {channels.length === 0 ? (
        <div>You are not subscribed to any channels.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {channels.map((ch) => (
            <li key={ch.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <a href={`/channel/${ch.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontWeight: 600 }}>{ch.channelName}</div>
                {ch.channelDescription && (
                  <div style={{ fontSize: 12, color: '#666' }}>{ch.channelDescription}</div>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
