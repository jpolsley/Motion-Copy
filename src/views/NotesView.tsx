import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Tag,
  Trash2,
  Box,
} from 'lucide-react';
import { NoteItem } from '../types';

export default function NotesView() {
  const { state, openDialog, deleteNote, updateNote, createNote } = useApp();
  const [selectedNoteId, setSelectedNoteId] = useState<string>(state.notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedNote = state.notes.find((n) => n.id === selectedNoteId) || state.notes[0];

  const filteredNotes = state.notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Notes Sidebar */}
      <div
        style={{
          width: '280px',
          borderRight: '1px solid #e5e7eb',
          background: '#fbfbfb',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>AI Meeting Notes</h2>
            <button
              className="toolbar-btn"
              style={{ padding: '2px 6px', fontSize: '11px' }}
              onClick={() => {
                const note = createNote({ title: 'New Meeting Doc', content: '' });
                setSelectedNoteId(note.id);
              }}
            >
              <Plus size={12} />
              <span>Doc</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '0 8px',
              height: '30px',
            }}
          >
            <Search size={12} style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '11px', width: '100%' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
          {filteredNotes.map((note) => {
            const isSelected = note.id === selectedNote?.id;
            return (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: isSelected ? '#ffffff' : 'transparent',
                  border: isSelected ? '1px solid #e5e7eb' : '1px solid transparent',
                  boxShadow: isSelected ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
                  cursor: 'pointer',
                  marginBottom: '2px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {note.title}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {note.content.split('\n')[0] || 'Empty doc'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note Editor Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: '#ffffff' }}>
        {selectedNote ? (
          <>
            <div style={{ padding: '14px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#111827',
                  border: 'none',
                  outline: 'none',
                  width: '60%',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn-motion-new"
                  style={{ width: 'auto', padding: '0 12px', height: '30px', margin: 0, background: 'linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%)' }}
                  onClick={() => openDialog('extract-notes', selectedNote)}
                >
                  <Sparkles size={13} />
                  <span>AI Extract Action Items</span>
                </button>

                <button
                  className="toolbar-btn"
                  onClick={() => deleteNote(selectedNote.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <textarea
              value={selectedNote.content}
              onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
              placeholder="Paste transcript or notes here..."
              style={{
                flex: 1,
                padding: '24px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '13px',
                lineHeight: '1.7',
                color: '#374151',
              }}
            />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            Select or create a doc.
          </div>
        )}
      </div>
    </div>
  );
}
