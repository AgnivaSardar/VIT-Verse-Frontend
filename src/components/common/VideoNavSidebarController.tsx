import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUI } from '../../contexts/UIContext';

const VIDEO_PATH_RE = /^\/video(\/|$)/i;

const VideoNavSidebarController: React.FC = () => {
  const location = useLocation();
  const { isSidebarOpen, closeSidebar, openSidebar } = useUI();
  const navCollapsedByVideo = useRef(false);

  useEffect(() => {
    const isVideo = VIDEO_PATH_RE.test(location.pathname);
    const isMobile = window.innerWidth <= 768;
    console.debug('[VideoNav] route change', { path: location.pathname, isVideo, isSidebarOpen, isMobile, navCollapsed: navCollapsedByVideo.current });

    if (isVideo) {
      // entering a video page: collapse if currently open
      if (isSidebarOpen) {
        try {
          console.debug('[VideoNav] collapsing sidebar on entering video');
          closeSidebar();
          navCollapsedByVideo.current = true;
        } catch (e) {
          console.warn('[VideoNav] failed to collapse sidebar', e);
        }
      }
    } else {
      // For non-video navigation on DESKTOP only, ensure sidebar is open
      // On mobile, leave it closed unless user explicitly opens it
      if (!isMobile) {
        try {
          console.debug('[VideoNav] opening sidebar on non-video navigation (desktop)');
          openSidebar();
        } catch (e) {
          console.warn('[VideoNav] failed to open sidebar', e);
        }
      }
      navCollapsedByVideo.current = false;
    }
  }, [location.pathname, isSidebarOpen, closeSidebar, openSidebar]);

  // If user manually re-opens sidebar while on a video, cancel auto-restore
  useEffect(() => {
    const isVideo = VIDEO_PATH_RE.test(location.pathname);
    if (isVideo && isSidebarOpen && navCollapsedByVideo.current) {
      console.debug('[VideoNav] user manually reopened sidebar while on video — cancel auto-restore');
      navCollapsedByVideo.current = false;
    }
  }, [isSidebarOpen, location.pathname]);

  return null;
};

export default VideoNavSidebarController;
