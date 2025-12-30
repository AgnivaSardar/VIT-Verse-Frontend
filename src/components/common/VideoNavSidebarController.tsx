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
    console.debug('[VideoNav] route change', { path: location.pathname, isVideo, isSidebarOpen, navCollapsed: navCollapsedByVideo.current });

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
      // For any non-video navigation, ensure sidebar is open (user wanted it visible)
      try {
        console.debug('[VideoNav] opening sidebar on non-video navigation');
        openSidebar();
      } catch (e) {
        console.warn('[VideoNav] failed to open sidebar', e);
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
