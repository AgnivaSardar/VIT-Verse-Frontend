import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../../styles/modal.css';
import { videosApi } from '../../services/videosApi';

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  video: any;
  onSaved: (updated: any) => void;
}

const EditVideoModal: React.FC<Props> = ({ isOpen, onRequestClose, video, onSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      // Robustly handle tags: array, object, string, or undefined
      let tagList: string[] = [];
      if (Array.isArray(video.tags)) {
        // Array of strings or array of objects with name property
        if (video.tags.length > 0 && typeof video.tags[0] === 'object' && video.tags[0] !== null) {
          tagList = video.tags.map((t: any) => t.name || t);
        } else {
          tagList = video.tags;
        }
      } else if (typeof video.tags === 'string') {
        tagList = video.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      } else if (video.tags && typeof video.tags === 'object' && video.tags !== null) {
        // Possibly an object with a 'name' property (single tag)
        if (video.tags.name) {
          tagList = [video.tags.name];
        }
      }
      // Fallback: extract from video.videoTags if tags is missing or empty
      if ((!tagList || tagList.length === 0) && Array.isArray(video.videoTags)) {
        tagList = video.videoTags.map((vt: any) => vt.tag?.name).filter(Boolean);
      }
      setTags(tagList.join(', '));
    }
    // Accessibility: set app element for react-modal when running in browser
    try {
      if (typeof document !== 'undefined') {
        const root = document.getElementById('root') || document.body;
        Modal.setAppElement(root as HTMLElement | string);
      }
    } catch (_e) {
      // ignore in SSR or test env where document may not be available
    }
  }, [video]);

  const handleSave = async () => {
    if (!video) return;
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        tags: tags,
      };
      const res = await videosApi.update(Number(video.vidID || video.id), payload);
      const data = res?.data ?? res;
      onSaved(data);
      onRequestClose();
    } catch (err) {
      console.error('Failed to update video', err);
      alert('Failed to update video');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Edit Video" ariaHideApp={false}>
      <div className="modal-header">
        <h3>Edit Video</h3>
        <button onClick={onRequestClose} aria-label="Close">✕</button>
      </div>
      <div className="modal-body">
        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Tags (comma separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} />
      </div>
      <div className="modal-footer">
        <button onClick={onRequestClose} className="btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </Modal>
  );
};

export default EditVideoModal;
