import { useEffect, useState } from 'react';
import { useUI } from '../contexts/UIContext';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ChannelCard from '../components/common/ChannelCard';
import { subscriptionsApi } from '../services/subscriptionsApi';
import type { Channel } from '../types';
import '../styles/layout.css';

export default function Subscriptions() {
  const { isSidebarOpen } = useUI();
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
          id: c.publicID || c.channelID || c.id || 0,
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

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main className={`home-main ${!isSidebarOpen ? 'expanded' : ''}`}>
        <div style={{ padding: '0 24px' }}>
          <h2 style={{ marginBottom: 20, fontSize: '24px' }}>Your Subscriptions</h2>

          {loading ? (
            <div className="loading">Loading subscriptions...</div>
          ) : error ? (
            <div style={{ color: 'crimson' }}>{error}</div>
          ) : channels.length === 0 ? (
            <div className="no-results">You are not subscribed to any channels.</div>
          ) : (
            <div className="channel-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              {channels.map((ch) => (
                <ChannelCard key={ch.id} channel={ch} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
