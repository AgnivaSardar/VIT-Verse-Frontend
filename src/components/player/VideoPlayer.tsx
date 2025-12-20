import React from 'react';
import '../../styles/video-detail.css';

interface VideoPlayerProps {
	src?: string;
	poster?: string;
	title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, title }) => {
	return (
		<div className="video-player-shell">
			{src ? (
				<video className="video-player" controls poster={poster} preload="metadata">
					<source src={src} />
					Your browser does not support the video tag.
				</video>
			) : (
				<div className="video-player placeholder">
					<p>No video source available.</p>
				</div>
			)}
			<div className="video-player-title">{title}</div>
		</div>
	);
};

export default VideoPlayer;
