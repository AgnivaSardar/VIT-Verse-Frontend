import React, { useState, useEffect } from 'react';
import { FaUpload, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { videosApi } from '../services/videosApi';
import { tagsApi, type Tag } from '../services/tagsApi';
import '../styles/layout.css';
import '../styles/upload.css';

interface VideoFormData {
  title: string;
  description: string;
  file?: File;
  tags: string[];
}

const Upload: React.FC = () => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    tags: [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tag[]>([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  useEffect(() => {
    loadPopularTags();
  }, []);

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

      setUploadProgress(25);
      const result = await videosApi.upload(uploadFormData);
      setUploadProgress(100);
      
      toast.success('Video uploaded successfully!');
      setFormData({ title: '', description: '', tags: [] });
      setUploadProgress(0);
    } catch (error) {
      toast.error('Upload failed. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

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
            <div className="form-section">
              <label className="form-label">Video Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title"
                className="form-input"
                disabled={uploading}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter video description"
                className="form-textarea"
                rows={4}
                disabled={uploading}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Video File *</label>
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

            <div className="form-section">
              <label className="form-label">Tags</label>
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
                    className="form-input"
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
                        className="form-input"
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

            {uploading && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="progress-text">{uploadProgress}% uploaded</p>
              </div>
            )}

            <button
              type="submit"
              className="upload-button"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Upload;
