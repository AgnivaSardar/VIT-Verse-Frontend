import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBolt, FaLayerGroup, FaTag, FaPlayCircle } from 'react-icons/fa';
import { tagsApi, type Tag } from '../../services/tagsApi';
import { channelsApi } from '../../services/channelsApi';
import { subscriptionsApi } from '../../services/subscriptionsApi';
import type { Channel } from '../../types';
import '../../styles/sidebar.css';

interface NavLink {
  path: string;
  label: string;
  icon: React.ReactNode;
}

// Link trending and subscriptions to Home sections (not separate pages)
const mainNav: NavLink[] = [
  { path: '/', label: 'Home', icon: <FaHome /> },
  { path: '/#trending', label: 'Trending', icon: <FaBolt /> },
  { path: '/#subscriptions', label: 'Subscriptions', icon: <FaLayerGroup /> },
];

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  const [topTags, setTopTags] = useState<Tag[]>([]);
  const [topChannels, setTopChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [tagsRes, channelsRes, subsRes] = await Promise.allSettled([
          tagsApi.getPopular(),
          channelsApi.getAll(),
          subscriptionsApi.mine(),
        ]);

        if (tagsRes.status === 'fulfilled') {
          const data = (tagsRes.value as any)?.data ?? tagsRes.value;
          setTopTags(Array.isArray(data) ? data.slice(0, 5) : []);
        }

        if (subsRes.status === 'fulfilled') {
          const data = (subsRes.value as any)?.data ?? subsRes.value;
          if (Array.isArray(data)) {
            const normalized = data.map((c: any) => ({
              ...c,
              id: c.id ?? c.channelID,
            }));
            setTopChannels(normalized.slice(0, 5));
          }
        }

        // fallback: top popular channels if no subs
        if (subsRes.status !== 'fulfilled' || !Array.isArray((subsRes.value as any)?.data ?? subsRes.value)) {
          if (channelsRes.status === 'fulfilled') {
            const data = (channelsRes.value as any)?.data ?? channelsRes.value;
            if (Array.isArray(data)) {
              const sorted = [...data]
                .map((c) => ({ ...c, id: (c as any).id ?? (c as any).channelID }))
                .sort((a, b) => (b.channelSubscribers || 0) - (a.channelSubscribers || 0));
              setTopChannels(sorted.slice(0, 5));
            } else {
              setTopChannels([]);
            }
          }
        }
      } catch (error) {
        console.error('Sidebar data load failed', error);
      }
    };

    fetchSidebarData();
  }, []);

  const isActive = (path: string) => {
    // Handle Home and hash-based section links
    if (path === '/') return location.pathname === '/';
    const [base, hash] = path.split('#');
    if (base === '/' && hash) {
      return location.pathname === '/' && location.hash === `#${hash}`;
    }
    return location.pathname.startsWith(path);
  };

  const renderNavLinks = (links: NavLink[]) =>
    links.map((link) => (
      <Link
        key={link.path}
        to={link.path}
        className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
      >
        {link.icon}
        <span>{link.label}</span>
      </Link>
    ));

  return (
    <aside className={collapsed ? 'collapsed' : ''}>
      {renderNavLinks(mainNav)}
      {!collapsed && (
        <>
          <hr style={{ margin: '8px 0', border: 0, borderTop: '1px solid #eee' }} />

          <p className="section-title">Subscribed Channels</p>
          {topChannels.length ? (
            topChannels
              .filter((channel) => channel.id !== undefined && channel.id !== null)
              .map((channel) => (
              <Link
                key={channel.id || channel.channelName}
                to={`/channel/${channel.id}`}
                className={`nav-link ${isActive(`/channel/${channel.id}`) ? 'active' : ''}`}
              >
                <FaLayerGroup />
                <span>{channel.channelName}</span>
              </Link>
              ))
          ) : (
            <div className="nav-link muted">
              <FaLayerGroup />
              <span style={{ paddingLeft: 6 }}>No channels subscribed</span>
            </div>
          )}

          <p className="section-title">Tags</p>
          {topTags.length ? (
            topTags.slice(0, 5).map((tag) => (
              <Link
                key={tag.id || tag.name}
                to={`/search?q=${encodeURIComponent(tag.name)}`}
                className="nav-link"
              >
                <FaTag />
                <span>{tag.name}</span>
              </Link>
            ))
          ) : (
            <div className="nav-link muted">
              <FaPlayCircle />
              <span>Loading tags</span>
            </div>
          )}

          <hr style={{ margin: '16px 0', border: 0, borderTop: '1px solid #eee' }} />
          
          <div className="sidebar-footer">
            <div className="footer-links">
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/copyright" className="footer-link">Copyright</Link>
              <Link to="/contact" className="footer-link">Contact us</Link>
              <Link to="/developers" className="footer-link">Developers</Link>
            </div>
            <div className="footer-links">
              <Link to="/terms" className="footer-link">Terms</Link>
              <Link to="/privacy" className="footer-link">Privacy</Link>
              <Link to="/policy" className="footer-link">Policy & Safety</Link>
              <Link to="/how-it-works" className="footer-link">How VIT-Verse works</Link>
            </div>
            <div className="footer-copyright">
              © 2025 VIT-Verse <br />Agniva Sardar
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
