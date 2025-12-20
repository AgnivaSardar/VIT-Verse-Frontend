import api from './api';

export interface TranscodeJob {
  videoId: number;
  quality: '720p' | '1080p' | '480p';
}

export const jobsApi = {
  transcodeVideo: (data: TranscodeJob) =>
    api.post('jobs/transcode', data),
};
