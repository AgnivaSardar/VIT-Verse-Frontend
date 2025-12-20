import React, { useState } from 'react';
import { FaUpload, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import { videosApi } from '../services/videosApi';
import '../styles/layout.css';
import '../styles/upload.css';

interface VideoFormData {
  title: string;
  description: string;
  file?: File;
}

const Upload: React.FC = () => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
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

      // Simulate progress until the request returns
      setUploadProgress(25);
      await videosApi.upload(uploadFormData);
      setUploadProgress(100);
      toast.success('Video uploaded successfully!');
      setFormData({ title: '', description: '' });
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
            <p>Share your lectures, events, or projects with VITC community</p>
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
                  disabled={uploading}
                />
                <div className="file-upload-area">
                  <FaUpload className="upload-icon" />
                  <p>
                    {formData.file ? (
                      <>
                        <FaCheck className="check-icon" /> {formData.file.name}
                      </>
                    ) : (
                      <>Drag and drop your video here or click to browse</>
                    )}
                  </p>
                </div>
              </div>
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
