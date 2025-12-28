import React, { useState, useEffect } from 'react';
import { FaUpload, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { videosApi, pollProcessingProgress } from '../services/videosApi';
import { tagsApi, type Tag } from '../services/tagsApi';
import { channelsApi } from '../services/channelsApi';
import { playlistsApi, type Playlist } from '../services/playlistsApi';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';
import '../styles/upload.css';
import FlappyBird from '../components/ui/FlappyBird';

interface VideoFormData {
  title: string;
  description: string;
  file?: File;
  thumbnail?: File;
  tags: string[];
  playlistID?: number | string;
}

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    tags: [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<number | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [hasChannel, setHasChannel] = useState<boolean | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showFlappy, setShowFlappy] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.error('Please log in to upload videos');
      // Do not redirect, just block form rendering below
      return;
    }
    checkUserChannel();
    loadPopularTags();
    loadPlaylists();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    // Refresh channel check whenever the window regains focus
    const handleFocus = () => {
      checkUserChannel();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token]);

  const checkUserChannel = async () => {
    if (!token) return;
    try {
      const response = await channelsApi.getMyChannel();
      setHasChannel(!!response.data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setHasChannel(false);
      } else {
        console.error('Failed to check channel:', error);
        setHasChannel(false);
      }
    }
  };

  const loadPlaylists = async () => {
    if (!token) return;
    try {
      const response = await playlistsApi.getMyPlaylists();
      setPlaylists(response.data || []);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    }
  };

  const loadPopularTags = async () => {
    try {
      const response = await tagsApi.getPopular();
      setPopularTags(response.data || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const searchTags = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await tagsApi.search(query);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Tag search failed:', error);
      setSearchResults([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }
      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file for thumbnail');
        return;
      }
      setFormData((prev) => ({ ...prev, thumbnail: file }));
    }
  };

  const addTag = (tagName: string) => {
    if (!tagName.trim()) return;
    if (formData.tags.includes(tagName)) {
      toast.error('Tag already added');
      return;
    }
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagName] }));
    setSearchQuery('');
    setSearchResults([]);
    setNewTagName('');
    setShowTagInput(false);
  };

  const removeTag = (tagName: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagName),
    }));
  };

  const createAndAddTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Please enter a tag name');
      return;
    }
    try {
      await tagsApi.create({ name: newTagName.trim() });
      addTag(newTagName.trim());
      toast.success('Tag created and added');
      await loadPopularTags();
    } catch (error) {
      toast.error('Failed to create tag');
      console.error(error);
    }
  };

  const pollBackendProgress = async (uploadId: string) => {
    setProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('processing');
    setProcessingError(null);
    let done = false;
    while (!done) {
      try {
        const res = await pollProcessingProgress(uploadId);
        setProcessingProgress(res.percent);
        setProcessingStatus(res.status);
        if (res.status === 'completed') {
          done = true;
          setProcessing(false);
          toast.success('Video processing complete!');
        } else if (res.status === 'failed') {
          done = true;
          setProcessing(false);
          setProcessingError(res.error || 'Processing failed');
          toast.error('Video processing failed.');
        } else {
          await new Promise((r) => setTimeout(r, 1500));
        }
      } catch (err: any) {
        setProcessingError('Could not fetch processing progress.');
        setProcessing(false);
        done = true;
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    if (!formData.file) {
      toast.error('Please select a video file');
      return;
    }

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('video', formData.file);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);

      if (formData.tags.length > 0) {
        uploadFormData.append('tags', JSON.stringify(formData.tags));
      }

      if (formData.playlistID) {
        uploadFormData.append('playlistID', formData.playlistID.toString());
      }

      if (formData.thumbnail) {
        uploadFormData.append('thumbnail', formData.thumbnail);
      }

      setUploadProgress(0);
      const uploadRes = await videosApi.uploadWithProgress(uploadFormData, (percent: number) => {
        setUploadProgress(percent);
        if (percent === 100) {
          setProcessing(true);
        }
      });
      setUploadProgress(100);
      setProcessing(true);
      // Use returned publicID if available, else fallback to vidID for polling
      const videoResp = (uploadRes as any)?.video;
      const uploadId = videoResp?.publicID || videoResp?.vidID?.toString();
      if (uploadId) {
        await pollBackendProgress(uploadId);
      } else {
        setProcessing(false);
      }
      toast.success('Video uploaded successfully!');
      setFormData({ title: '', description: '', tags: [] });
      setUploadProgress(0);
    } catch (error: any) {
      setProcessing(false);
      const errorMsg = error?.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  if (hasChannel === null) {
    return (
      <div className="app-container">
        <Header />
        <Sidebar />
        <main>
          <div className="upload-container">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (hasChannel === false) {
    return (
      <div className="app-container">
        <Header />
        <Sidebar />
        <main>
          <div className="upload-container">
            <div className="no-channel-message">
              <h2>Create a Channel First</h2>
              <p>You need to create a channel before you can upload videos.</p>
              <p>Each user can have only one channel where all your videos will be published.</p>
              <button
                className="create-channel-button"
                onClick={() => navigate('/channels/create')}
              >
                Create Channel
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <Sidebar />

      <main>
        <div className="upload-container">
          <div className="upload-header">
            <h1>Upload Video</h1>
            <p>Share your lectures, events, or projects with the VIT-Verse community</p>
          </div>

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="upload-field">
              <label className="upload-label">Video Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title"
                className="upload-input"
                disabled={uploading}
              />
            </div>

            <div className="upload-field">
              <label className="upload-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter video description"
                className="upload-textarea"
                rows={4}
                disabled={uploading}
              />
            </div>

            <div className="upload-field">
              <label className="upload-label">Video File *</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="file-input"
                  id="video-file-input"
                  disabled={uploading}
                />
                <label htmlFor="video-file-input" className="file-upload-area">
                  <FaUpload className="upload-icon" />
                  <p>
                    {formData.file ? (
                      <>
                        <FaCheck className="check-icon" /> {formData.file.name}
                      </>
                    ) : (
                      <>Click to select a video file from your computer</>
                    )}
                  </p>
                  {formData.file && (
                    <span className="file-size">
                      ({(formData.file.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  )}
                </label>
              </div>
            </div>

            <div className="upload-field">
              <label className="upload-label">Custom Thumbnail (Optional)</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="file-input"
                  id="thumbnail-file-input"
                  disabled={uploading}
                />
                <label htmlFor="thumbnail-file-input" className="file-upload-area">
                  <FaUpload className="upload-icon" />
                  <p>
                    {formData.thumbnail ? (
                      <>
                        <FaCheck className="check-icon" /> {formData.thumbnail.name}
                      </>
                    ) : (
                      <>Click to select a thumbnail image, or we will auto-generate one</>
                    )}
                  </p>
                  {formData.thumbnail && (
                    <span className="file-size">
                      ({(formData.thumbnail.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  )}
                </label>
              </div>
              <p className="upload-hint">If you skip this, a frame from the video will be used as the thumbnail.</p>
            </div>

            <div className="upload-field">
              <label className="upload-label">Playlist (Optional)</label>
              <select
                name="playlistID"
                value={formData.playlistID || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  playlistID: e.target.value || undefined
                }))}
                className="upload-input"
                disabled={uploading}
              >
                <option value="">No Playlist (Independent)</option>
                {playlists.map((playlist) => (
                  <option key={playlist.publicID || playlist.pID || playlist.id || playlist.name} value={playlist.publicID || playlist.pID}>
                    {playlist.name}
                  </option>
                ))}
              </select>
              <p className="upload-hint">You can add this video to a playlist later by editing it</p>
            </div>

            <div className="upload-field">
              <label className="upload-label">Tags</label>
              <div className="tags-container">
                {formData.tags.map((tag) => (
                  <div key={tag} className="tag-chip">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="tag-remove"
                      disabled={uploading}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="add-tag-button"
                  disabled={uploading}
                >
                  <FaPlus /> Add Tag
                </button>
              </div>

              {showTagInput && (
                <div className="tag-input-section">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchTags(e.target.value);
                    }}
                    placeholder="Search existing tags..."
                    className="upload-input"
                    disabled={uploading}
                  />

                  {searchResults.length > 0 && (
                    <div className="tag-suggestions">
                      {searchResults.map((tag) => (
                        <div
                          key={tag.id}
                          onClick={() => addTag(tag.name)}
                          className="tag-suggestion"
                        >
                          {tag.name}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="create-tag-section">
                    <p>Or create a new tag:</p>
                    <div className="create-tag-input">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Enter new tag name"
                        className="upload-input"
                        disabled={uploading}
                      />
                      <button
                        type="button"
                        onClick={createAndAddTag}
                        className="create-tag-button"
                        disabled={uploading}
                      >
                        Create & Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {popularTags.length > 0 && (
                <div className="popular-tags">
                  <p className="popular-tags-label">Popular tags:</p>
                  <div className="popular-tags-list">
                    {popularTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => addTag(tag.name)}
                        className="popular-tag"
                        disabled={uploading || formData.tags.includes(tag.name)}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {(uploading || processing) && showFlappy && (
              <FlappyBird onClose={() => setShowFlappy(false)} />
            )}

            {(uploading || processing) && (
              <div className="progress-section">
                <div className={`progress-bar ${processing && uploadProgress === 100 ? 'processing' : ''}`}>
                  <div
                    className={`progress-fill ${processing && uploadProgress === 100 ? 'pulsing' : ''}`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="progress-text">
                  {uploadProgress < 100 && `${uploadProgress}% uploaded`}
                  {uploadProgress === 100 && processing &&
                    (processingProgress !== null && processingStatus !== 'completed' ?
                      `Processing... ${processingProgress}%` :
                      'Processing on server...')}
                  {uploadProgress === 100 && !processing && !processingError && 'Finalizing...'}
                  {processingError && <span className="error-text">{processingError}</span>}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="upload-button"
              disabled={uploading}
            >
              {uploading ? (processing ? 'Processing...' : 'Uploading...') : 'Upload Video'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Upload;
