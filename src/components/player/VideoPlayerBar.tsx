import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; // ADD THIS
import { FaPlay, FaPause, FaVolumeUp, FaForward, FaBackward, FaExpand, FaCog } from 'react-icons/fa';
import './VideoPlayerBar.css';
import { useUI } from '../../contexts/UIContext';

const VIDEO_PATH_RE = /^\/video(\/|$)/i; // ADD THIS

interface VideoPlayerBarProps {
  src: string;
  poster?: string;
}

const VideoPlayerBar: React.FC<VideoPlayerBarProps> = ({ src, poster }) => {
  const location = useLocation(); // ADD THIS
  const { isSidebarOpen, toggleSidebar } = useUI();
  const wasOpenBeforeCollapse = useRef(false);
  const autoCollapsedRef = useRef(false);
  const hasInitializedRef = useRef(false); // ADD THIS - prevents multiple collapses

  const isVideoPage = VIDEO_PATH_RE.test(location.pathname); // ADD THIS

  // Collapse sidebar when FIRST entering video page
  useEffect(() => {
    if (isVideoPage && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (isSidebarOpen && !autoCollapsedRef.current) {
        wasOpenBeforeCollapse.current = true;
        autoCollapsedRef.current = true;
        toggleSidebar(); // Collapse
      }
    }
  }, [location.pathname, isSidebarOpen, toggleSidebar]); // FIXED: use location.pathname

  // User manually toggles during video → respect choice
  useEffect(() => {
    if (isVideoPage && autoCollapsedRef.current && isSidebarOpen) {
      autoCollapsedRef.current = false;
      wasOpenBeforeCollapse.current = false;
    }
  }, [isSidebarOpen, isVideoPage]);

  // Restore on leaving video page
  useEffect(() => {
    return () => {
      if (autoCollapsedRef.current && wasOpenBeforeCollapse.current) {
        toggleSidebar(); // Restore
      }
    };
  }, [toggleSidebar]);

  // Reset flags when navigating to new video page
  useEffect(() => {
    if (isVideoPage) {
      hasInitializedRef.current = false; // Reset for new video
    }
  }, [location.pathname, isVideoPage]);

  // ... ALL YOUR EXISTING VIDEO LOGIC (unchanged from previous version) ...
  const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [resolution, setResolution] = useState('default');

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  const handleResolutionChange = (res: string) => {
    setResolution(res);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      // Try different fullscreen methods for cross-browser compatibility
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      } else if ((container as any).mozRequestFullScreen) {
        (container as any).mozRequestFullScreen();
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen();
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [src]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [volumePanelVisible, setVolumePanelVisible] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);
  const [showPlayIndicator, setShowPlayIndicator] = useState(false);
  const lastTapRef = useRef<number>(0);
  const tapCountRef = useRef<number>(0);
  const tapTimeoutRef = useRef<number | undefined>(undefined);
  const idleTimeoutRef = useRef<number | undefined>(undefined);

  const handlePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const isMobile = window.innerWidth <= 768;
    
    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setShowPauseOverlay(false);
    } else {
      video.pause();
      setIsPlaying(false);
      // Only show pause overlay on desktop, not mobile
      if (!isMobile) {
        setShowPauseOverlay(true);
      }
    }
  }, []);

  // ... ALL OTHER FUNCTIONS EXACTLY THE SAME (handleVideoClick, handleVideoDoubleTap, etc.) ...
  const handleVideoClick = () => {
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
      // Desktop: single click pauses immediately
      handlePlayPause();
    }
    // Mobile: handled by touch events
  };

  const handleVideoDoubleTap = useCallback((action: 'left' | 'right' | 'middle') => {
    const video = videoRef.current;
    if (!video) return;
    const isMobile = window.innerWidth <= 768;
    
    if (action === 'left') {
      video.currentTime = Math.max(0, video.currentTime - 10);
      setCurrentTime(video.currentTime);
    } else if (action === 'right') {
      const activeDuration = video.duration || duration;
      video.currentTime = Math.min(activeDuration, video.currentTime + 10);
      setCurrentTime(video.currentTime);
    } else if (action === 'middle') {
      // Only allow middle double-tap fullscreen on desktop
      if (!isMobile) {
        handleFullscreen();
      }
    }
  }, [duration]);

  const handleVideoDoubleClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const clickX = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth;
    const third = width * 0.3;
    if (clickX < third) {
      handleVideoDoubleTap('left');
    } else if (clickX > width - third) {
      handleVideoDoubleTap('right');
    } else {
      handleVideoDoubleTap('middle');
    }
  };

  const handleVideoTouch = (e: React.TouchEvent<HTMLVideoElement>) => {
    const now = Date.now();
    const touch = e.touches[0] || e.changedTouches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const width = rect.width;
    const third = width * 0.35; // Larger regions for easier tapping

    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300) {
      // Double tap detected - this is for skip forward/backward
      e.preventDefault();
      e.stopPropagation();
      
      // Clear any pending single tap action
      if (tapTimeoutRef.current) {
        window.clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = undefined;
      }
      
      // Hide play indicator if showing
      setShowPlayIndicator(false);
      
      if (touchX < third) {
        // Left side - rewind
        handleVideoDoubleTap('left');
      } else if (touchX > width - third) {
        // Right side - forward
        handleVideoDoubleTap('right');
      }
      // Middle double-tap does nothing on mobile
      
      lastTapRef.current = 0; // Reset to prevent triple-tap issues
    } else {
      // Potential single tap - wait to see if it's a double tap
      lastTapRef.current = now;
      
      // Clear previous timeout if any
      if (tapTimeoutRef.current) {
        window.clearTimeout(tapTimeoutRef.current);
      }
      
      // Set timeout to handle as single tap if no second tap comes
      tapTimeoutRef.current = window.setTimeout(() => {
        // Single tap confirmed
        if (!showPlayIndicator) {
          // First tap: show current status
          setShowPlayIndicator(true);
          setTimeout(() => setShowPlayIndicator(false), 2000);
        } else {
          // Second tap while indicator visible: toggle play/pause
          handlePlayPause();
          // Show the new state briefly after toggle
          setTimeout(() => {
            setShowPlayIndicator(true);
            setTimeout(() => setShowPlayIndicator(false), 1000);
          }, 50);
        }
        tapTimeoutRef.current = undefined;
      }, 300); // Wait 300ms to distinguish from double tap
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const vol = Number(e.target.value);
    if (video) {
      video.volume = vol;
      setVolume(vol);
    }
  };

  const toggleVolumePanel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVolumePanelVisible(prev => !prev);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
  };

  const formatTime = (t: number) => {
    const min = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const resetIdleTimer = () => {
    setControlsVisible(true);
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      setVolumePanelVisible(false);
    }, 2000);
  };

  const handleMouseMoveInContainer = () => {
    resetIdleTimer();
  };

  const handleMouseLeaveContainer = () => {
    setControlsVisible(false);
    setVolumePanelVisible(false);
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active as HTMLElement)?.isContentEditable;

      if (isTyping) return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleVideoDoubleTap('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleVideoDoubleTap('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }
      if (tapTimeoutRef.current) {
        window.clearTimeout(tapTimeoutRef.current);
      }
    };
  }, [handlePlayPause, handleVideoDoubleTap]);

  // JSX RETURN SAME AS BEFORE - all controls unchanged
  return (
    <div className="video-player-bar" ref={containerRef}>
      <div
        className="video-player-bar__container"
        onMouseMove={handleMouseMoveInContainer}
        onMouseLeave={handleMouseLeaveContainer}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          controls={false}
          className="video-player-bar__video"
          onClick={handleVideoClick}
          onDoubleClick={handleVideoDoubleClick}
          onTouchEnd={handleVideoTouch}
        />
        {/* Pause Overlay */}
        {!isPlaying && showPauseOverlay && (
          <div className="video-player-bar__pause-overlay">
            <div className="video-player-bar__pause-icon">
              <FaPause />
            </div>
          </div>
        )}
        {/* Play Indicator Overlay (for mobile) */}
        {showPlayIndicator && (
          <div className="video-player-bar__play-indicator">
            <div className="video-player-bar__play-icon">
              {isPlaying ? <FaPause /> : <FaPlay />}
            </div>
          </div>
        )}
        {controlsVisible && (
          <div className="video-player-bar__controls-overlay" onClick={() => {
            if (volumePanelVisible) setVolumePanelVisible(false);
          }}>
            {/* Rewind - hidden on mobile */}
            <button onClick={e => { e.stopPropagation(); handleVideoDoubleTap('left'); }} className="video-player-bar__icon-btn video-player-bar__hide-mobile" title="Rewind 10s">
              <FaBackward />
            </button>
            {/* Play/Pause - always visible */}
            <button onClick={e => { e.stopPropagation(); handlePlayPause(); }} className="video-player-bar__icon-btn" title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            {/* Volume - hidden on mobile */}
            <div className="video-player-bar__volume-btn-container video-player-bar__hide-mobile" style={{ position: 'relative', display: 'inline-block' }} onClick={e => e.stopPropagation()}>
              <button className="video-player-bar__icon-btn" onClick={toggleVolumePanel} title="Volume">
                <FaVolumeUp />
              </button>
              {volumePanelVisible && (
                <div className="video-player-bar__volume-vertical-container" style={{
                  position: 'absolute', left: '50%', bottom: '120%', transform: 'translateX(-50%)',
                  zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  height: '80px', justifyContent: 'flex-end',
                }}>
                  <input type="range" min={0} max={1} step={0.01} value={volume} onChange={handleVolumeChange} className="video-player-bar__volume-vertical" />
                </div>
              )}
            </div>
            {/* Seek bar - always visible */}
            <input type="range" min={0} max={duration} value={currentTime} onChange={e => {
              const time = Number(e.target.value);
              setCurrentTime(time);
              if (videoRef.current) videoRef.current.currentTime = time;
            }} className="video-player-bar__seek" />
            {/* Time - always visible */}
            <span className="video-player-bar__time">{formatTime(currentTime)} / {formatTime(duration)}</span>
            {/* Forward - hidden on mobile */}
            <button onClick={e => { e.stopPropagation(); handleVideoDoubleTap('right'); }} className="video-player-bar__icon-btn video-player-bar__hide-mobile" title="Forward 10s">
              <FaForward />
            </button>
            {/* Fullscreen - always visible */}
            <button onClick={e => { e.stopPropagation(); handleFullscreen(); }} className="video-player-bar__icon-btn" title="Fullscreen">
              <FaExpand />
            </button>
            <div className="video-player-bar__settings-btn-container" style={{ position: 'relative', display: 'inline-block' }}>
              <button className="video-player-bar__icon-btn" onClick={e => { e.stopPropagation(); setSettingsPanelVisible(v => !v); }} title="Settings">
                <FaCog />
              </button>
              {settingsPanelVisible && (
                <div className="video-player-bar__settings-panel">
                  <div className="video-player-bar__settings-section">
                    <span className="video-player-bar__settings-label">Speed</span>
                    {[0.5, 1, 1.5, 2].map(rate => (
                      <button key={rate} className={`video-player-bar__settings-option${playbackRate === rate ? ' active' : ''}`} onClick={() => handleSpeedChange(rate)}>
                        {rate}x
                      </button>
                    ))}
                  </div>
                  <div className="video-player-bar__settings-section">
                    <span className="video-player-bar__settings-label">Resolution</span>
                    <button className={`video-player-bar__settings-option${resolution === 'default' ? ' active' : ''}`} onClick={() => handleResolutionChange('default')}>
                      Default
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayerBar;
