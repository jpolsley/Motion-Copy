import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, Video } from 'lucide-react';
import { EventType } from '../../types';

export default function MeetingDialog() {
  const { dialogOpen, closeDialog, createEvent } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('meeting');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('11:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [location, setLocation] = useState('Google Meet');
  const [attendees, setAttendees] = useState('');

  if (dialogOpen !== 'meeting') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const [h, m] = startTime.split(':').map(Number);
    const startObj = new Date(date + 'T00:00:00');
    startObj.setHours(h, m, 0, 0);

    const endObj = new Date(startObj.getTime() + durationMinutes * 60000);

    createEvent({
      title: title.trim(),
      description: description.trim(),
      type,
      startTime: startObj.toISOString(),
      endTime: endObj.toISOString(),
      isFixed: true,
      location: location.trim() || undefined,
      attendees: attendees ? attendees.split(',').map((s) => s.trim()) : [],
      color: type === 'meeting' ? '#4f46e5' : '#7c3aed',
    });

    closeDialog();
  };

  return (
    <div className="modal-overlay" onClick={closeDialog}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>Add Calendar Commitment</h2>
            <button type="button" className="btn-icon" onClick={closeDialog}>✕</button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Event Type</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setType('meeting')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    background: type === 'meeting' ? '#312e81' : 'var(--side)',
                    border: type === 'meeting' ? '1px solid #6366f1' : '1px solid var(--panel-border)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Fixed Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setType('focus_time')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    background: type === 'focus_time' ? '#581c87' : 'var(--side)',
                    border: type === 'focus_time' ? '1px solid #a855f7' : '1px solid var(--panel-border)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Protected Focus Block
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sprint Demo with Marketing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Length</label>
                <select
                  className="form-select"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Platform</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Google Meet, Zoom, Office"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Attendees (Comma-separated emails)</label>
              <input
                type="text"
                className="form-input"
                placeholder="sarah@example.com, marcus@example.com"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--side)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-dim)', border: '1px solid var(--border-subtle)' }}>
              ⚡ <strong>Adaptive Rescheduling:</strong> Saving this commitment will automatically adjust your flexible task blocks and protect buffer times.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closeDialog}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Schedule & Adjust Tasks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
