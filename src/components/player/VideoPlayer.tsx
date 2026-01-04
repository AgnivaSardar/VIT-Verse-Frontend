import React, { useEffect, useRef } from 'react';
import '../../styles/video-detail.css';

interface VideoPlayerProps {
	src?: string;
	poster?: string;
	title?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		console.log('🎬 VideoPlayer received src:', src);
		
		if (videoRef.current) {
			videoRef.current.addEventListener('error', (e) => {
				const target = e.target as HTMLVideoElement;
				console.error('❌ Video error:', {
					error: target.error,
					code: target.error?.code,
					message: target.error?.message,
					src: src
				});
			});

			videoRef.current.addEventListener('loadedmetadata', () => {
				console.log('✅ Video metadata loaded successfully');
			});

			videoRef.current.addEventListener('canplay', () => {
				console.log('✅ Video can play');
			});
		}
	}, [src]);

	return (
		<div className="video-player-shell">
			{src ? (
				<video 
					ref={videoRef}
					className="video-player" 
					controls 
					poster={poster} 
					preload="metadata"
					crossOrigin="anonymous"
				>
					<source src={src} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			) : (
				<div className="video-player placeholder">
					<p>No video source available.</p>
					<p style={{ fontSize: '0.875rem', color: '#888' }}>src is: {String(src)}</p>
				</div>
			)}
		</div>
	);
};

export default VideoPlayer;
