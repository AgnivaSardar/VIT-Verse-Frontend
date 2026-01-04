
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { videosApi } from '../../services/videosApi';
import { tagsApi, type Tag } from '../../services/tagsApi';
import { playlistsApi, type Playlist } from '../../services/playlistsApi';
import { useAuth } from '../../hooks/useAuth';
import type { Video } from '../../types/video';
import '../../styles/layout.css';
import '../../styles/upload.css';

function unwrap<T>(resp: any): T {
  if (resp && typeof resp === 'object' && 'data' in resp) {
    return (resp as any).data;
  }
  return resp as T;
}

interface VideoEditFormData {
  title: string;
  description: string;
  tags: string[];
  playlistID?: number;
  thumbnail?: File;
}

const VideoEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const videoIdRaw = id; // may be numeric or publicID
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState<VideoEditFormData>({ title: '', description: '', tags: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please log in to edit a video');
      navigate('/login', { replace: true });
      return;
    }
    if (!isAuthenticated || !videoIdRaw) return;
    const fetchVideo = async () => {
      setLoading(true);
      try {
        const response = await videosApi.getById(videoIdRaw as string);
        const data = unwrap<Video | undefined>(response);
        setVideo(data ?? null);
        if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            tags: Array.isArray(data.tags)
              ? (typeof data.tags[0] === 'object'
                  ? (data.tags as { id: number; name: string }[]).map(tagObj => tagObj.name)
                  : (data.tags as string[]))
              : [],
            playlistID: (data as any).playlistID ?? undefined,
          });
        }
      } catch (error) {
        toast.error('Failed to load video');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
    // Load playlists and tags
    const loadPlaylists = async () => {
      try {
        const response = await playlistsApi.getMyPlaylists();
        setPlaylists(response.data || []);
      } catch (error) {
        setPlaylists([]);
      }
    };
    const loadPopularTags = async () => {
      try {
        const response = await tagsApi.getPopular();
        setPopularTags(response.data || []);
      } catch (error) {
        setPopularTags([]);
      }
    };
    loadPlaylists();
    loadPopularTags();
  }, [videoIdRaw, isAuthenticated, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagName) }));
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
      const response = await tagsApi.getPopular();
      setPopularTags(response.data || []);
    } catch (error) {
      toast.error('Failed to create tag');
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
      setSearchResults([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a video title');
      return;
    }
    setSaving(true);
    try {
      const updateFormData = new FormData();
      updateFormData.append('title', formData.title);
      updateFormData.append('description', formData.description);
      if (formData.tags.length > 0) {
        updateFormData.append('tags', JSON.stringify(formData.tags));
      }
      if (formData.playlistID) {
        updateFormData.append('playlistID', formData.playlistID.toString());
      }
      if (formData.thumbnail) {
        updateFormData.append('thumbnail', formData.thumbnail);
      }
      await videosApi.update(videoIdRaw as string, updateFormData);
      toast.success('Video updated successfully!');
      navigate(-1);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Update failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main>
        <div className="upload-container">
          <div className="upload-header">
            <h1>Edit Video</h1>
            <p>Update your video details, tags, playlist, or thumbnail</p>
          </div>
          {loading ? (
            <div className="loading">Loading video...</div>
          ) : !video ? (
            <div className="no-results">Video not found.</div>
          ) : (
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
                  disabled={saving}
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
                  disabled={saving}
                />
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
                    disabled={saving}
                  />
                  <label htmlFor="thumbnail-file-input" className="file-upload-area">
                    <span>Click to select a thumbnail image, or keep existing</span>
                  </label>
                  {formData.thumbnail && (
                    <span className="file-size">
                      ({(formData.thumbnail.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  )}
                </div>
                <p className="upload-hint">If you skip this, the current thumbnail will remain unchanged.</p>
                {video.thumbnail && !formData.thumbnail && (
                  <div className="current-thumb-preview">
                    <img src={video.thumbnail} alt="Current thumbnail" style={{ width: 140, height: 80, objectFit: 'cover' }} />
                    <span className="muted">Current thumbnail</span>
                  </div>
                )}
              </div>

              <div className="upload-field">
                <label className="upload-label">Playlist (Optional)</label>
                <select
                  name="playlistID"
                  value={formData.playlistID || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, playlistID: e.target.value ? Number(e.target.value) : undefined }))}
                  className="upload-input"
                  disabled={saving}
                >
                  <option value="">No Playlist (Independent)</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id ?? playlist.pID ?? playlist.name} value={playlist.id ?? playlist.pID}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
                <p className="upload-hint">You can change the playlist for this video.</p>
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
                        disabled={saving}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowTagInput(!showTagInput)}
                    className="add-tag-button"
                    disabled={saving}
                  >
                    + Add Tag
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
                      disabled={saving}
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
                          disabled={saving}
                        />
                        <button
                          type="button"
                          onClick={createAndAddTag}
                          className="create-tag-button"
                          disabled={saving}
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
                          disabled={saving || formData.tags.includes(tag.name)}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="upload-button"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default VideoEdit;
