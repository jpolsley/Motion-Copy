import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function NoteDialog() {
  const { dialogOpen, closeDialog, createNote, state } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [projectId, setProjectId] = useState('');

  if (dialogOpen !== 'note') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createNote({
      title: title.trim(),
      content: content.trim(),
      tags: tags ? tags.split(',').map((t) => t.trim().replace(/^#/, '')) : [],
      projectId: projectId || undefined,
    });

    closeDialog();
    setTitle('');
    setContent('');
    setTags('');
    setProjectId('');
  };

  return (
    <div className="modal-overlay" onClick={closeDialog}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>New Connected Note</h2>
            <button type="button" className="btn-icon" onClick={closeDialog}>✕</button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Note Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sprint Retrospective Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tags (Comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Strategy, Engineering, Q3"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Link to Project</label>
              <select
                className="form-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">No Project</option>
                {state.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Content / Transcript</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '120px' }}
                placeholder="Write or paste meeting notes, decisions, or action items here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closeDialog}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
