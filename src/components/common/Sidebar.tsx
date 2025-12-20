import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBolt, FaLayerGroup, FaTag, FaPlayCircle } from 'react-icons/fa';
import { tagsApi, type Tag } from '../../services/tagsApi';
import { channelsApi } from '../../services/channelsApi';
import type { Channel } from '../../types';
import '../../styles/sidebar.css';

interface NavLink {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const mainNav: NavLink[] = [
  { path: '/', label: 'Home', icon: <FaHome /> },
  { path: '/trending', label: 'Trending at VIT-Verse', icon: <FaBolt /> },
  { path: '/subscriptions', label: 'Subscriptions', icon: <FaLayerGroup /> },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [topTags, setTopTags] = useState<Tag[]>([]);
  const [topChannels, setTopChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [tagsRes, channelsRes] = await Promise.allSettled([
          tagsApi.getPopular(),
          channelsApi.getAll(),
        ]);

        if (tagsRes.status === 'fulfilled') {
          const data = (tagsRes.value as any)?.data ?? tagsRes.value;
          setTopTags(Array.isArray(data) ? data.slice(0, 5) : []);
        }

        if (channelsRes.status === 'fulfilled') {
          const data = (channelsRes.value as any)?.data ?? channelsRes.value;
          if (Array.isArray(data)) {
            const sorted = [...data].sort(
              (a, b) => (b.channelSubscribers || 0) - (a.channelSubscribers || 0)
            );
            setTopChannels(sorted.slice(0, 5));
          } else {
            setTopChannels([]);
          }
        }
      } catch (error) {
        console.error('Sidebar data load failed', error);
      }
    };

    fetchSidebarData();
  }, []);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
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
    <aside>
      {renderNavLinks(mainNav)}
      <hr style={{ margin: '15px 0', border: 0, borderTop: '1px solid #eee' }} />

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
        <div className="nav-link muted">No channels</div>
      )}

      <p className="section-title">Tags</p>
      {topTags.length ? (
        topTags.map((tag) => (
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
    </aside>
  );
};

export default Sidebar;
