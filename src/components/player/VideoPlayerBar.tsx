import React, { useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaForward, FaBackward, FaExpand, FaCog } from 'react-icons/fa';
import './VideoPlayerBar.css';

interface VideoPlayerBarProps {
  src: string;
  poster?: string;
}

const VideoPlayerBar: React.FC<VideoPlayerBarProps> = ({ src, poster }) => {
        // Settings panel state
        const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);
        const [playbackRate, setPlaybackRate] = useState(1);
        const [resolution, setResolution] = useState('default');
        // Change video speed
        const handleSpeedChange = (rate: number) => {
          setPlaybackRate(rate);
          if (videoRef.current) videoRef.current.playbackRate = rate;
        };

        // Change video resolution (placeholder, for future multiple sources)
        const handleResolutionChange = (res: string) => {
          setResolution(res);
          // If you have multiple sources, switch src here
        };
      // Fullscreen logic
      const containerRef = useRef<HTMLDivElement>(null);
      const handleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          container.requestFullscreen();
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
  const lastTapRef = useRef<number>(0);
  const idleTimeoutRef = useRef<number | undefined>(undefined);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoClick = () => {
    handlePlayPause();
  };

  const handleVideoDoubleTap = (side: 'left' | 'right') => {
    const video = videoRef.current;
    if (!video) return;
    if (side === 'left') {
      video.currentTime = Math.max(0, video.currentTime - 10);
    } else {
      video.currentTime = Math.min(duration, video.currentTime + 10);
    }
    setCurrentTime(video.currentTime);
  };

  const handleVideoDoubleClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const clickX = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth;
    if (clickX < width / 2) {
      handleVideoDoubleTap('left');
    } else {
      handleVideoDoubleTap('right');
    }
  };

  const handleVideoTouch = (e: React.TouchEvent<HTMLVideoElement>) => {
    const now = Date.now();
    const touchX = e.touches[0].clientX;
    const width = e.currentTarget.offsetWidth;
    if (now - lastTapRef.current < 300) {
      if (touchX < width / 2) {
        handleVideoDoubleTap('left');
      } else {
        handleVideoDoubleTap('right');
      }
    }
    lastTapRef.current = now;
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
    e.stopPropagation(); // prevent closing due to overlay click
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

  // Idle / mouse movement logic
  const resetIdleTimer = () => {
    setControlsVisible(true);
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = window.setTimeout(() => {
      setControlsVisible(false);
      setVolumePanelVisible(false);
    }, 2000); // 2s after last movement
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
    return () => {
      if (idleTimeoutRef.current) {
        window.clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

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
        {controlsVisible && (
          <div
            className="video-player-bar__controls-overlay"
            onClick={() => {
              // click on empty bar area closes volume panel
              if (volumePanelVisible) setVolumePanelVisible(false);
            }}
          >
            <button
              onClick={e => {
                e.stopPropagation();
                handleVideoDoubleTap('left');
              }}
              className="video-player-bar__icon-btn"
              title="Rewind 10s"
            >
              <FaBackward />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="video-player-bar__icon-btn"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <div
              className="video-player-bar__volume-btn-container"
              style={{ position: 'relative', display: 'inline-block' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="video-player-bar__icon-btn"
                onClick={toggleVolumePanel}
                title="Volume"
              >
                <FaVolumeUp />
              </button>
              {volumePanelVisible && (
                <div
                  className="video-player-bar__volume-vertical-container"
                  style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '120%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '80px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="video-player-bar__volume-vertical"
                  />
                </div>
              )}
            </div>

            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={e => {
                const time = Number(e.target.value);
                setCurrentTime(time);
                if (videoRef.current) videoRef.current.currentTime = time;
              }}
              className="video-player-bar__seek"
            />
            <span className="video-player-bar__time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                handleVideoDoubleTap('right');
              }}
              className="video-player-bar__icon-btn"
              title="Forward 10s"
            >
              <FaForward />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                handleFullscreen();
              }}
              className="video-player-bar__icon-btn"
              title="Fullscreen"
            >
              <FaExpand />
            </button>
            <div className="video-player-bar__settings-btn-container" style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className="video-player-bar__icon-btn"
                onClick={e => { e.stopPropagation(); setSettingsPanelVisible(v => !v); }}
                title="Settings"
              >
                <FaCog />
              </button>
              {settingsPanelVisible && (
                <div className="video-player-bar__settings-panel">
                  <div className="video-player-bar__settings-section">
                    <span className="video-player-bar__settings-label">Speed</span>
                    {[0.5, 1, 1.5, 2].map(rate => (
                      <button
                        key={rate}
                        className={`video-player-bar__settings-option${playbackRate === rate ? ' active' : ''}`}
                        onClick={() => handleSpeedChange(rate)}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                  <div className="video-player-bar__settings-section">
                    <span className="video-player-bar__settings-label">Resolution</span>
                    <button
                      className={`video-player-bar__settings-option${resolution === 'default' ? ' active' : ''}`}
                      onClick={() => handleResolutionChange('default')}
                    >
                      Default
                    </button>
                    {/* Add more resolution options if available */}
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
