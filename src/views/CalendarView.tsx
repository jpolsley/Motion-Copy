import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  Video,
  CheckCircle2,
  Trash2,
  Lock,
  Unlock,
} from 'lucide-react';
import { CalendarEvent, TaskItem } from '../types';

export default function CalendarView() {
  const { state, openDialog, toggleTaskStatus, toggleTaskLock, runAutoSchedule, deleteEvent } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // 7 days window (e.g. Sun 22, Mon 23, Tue 24, Wed 25, Thu 26, Fri 27, Sat 28)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(selectedDate);
    const dayOfWeek = d.getDay();
    // Start week on Sunday
    d.setDate(d.getDate() - dayOfWeek + i);
    return d;
  });

  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH} ${period}`;
  };

  const handlePrevWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 7);
    setSelectedDate(next);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="motion-calendar-container">
      {/* Top Control Strip */}
      <div
        style={{
          height: '48px',
          borderBottom: '1px solid var(--panel-border)',
          padding: '0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
            {selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            <button className="formatting-btn" onClick={handlePrevWeek} style={{ borderRadius: 0, padding: '4px 8px' }}>
              <ChevronLeft size={14} />
            </button>
            <button
              style={{ background: 'transparent', border: 'none', fontSize: '12px', fontWeight: 600, padding: '0 8px', cursor: 'pointer', color: '#374151' }}
              onClick={handleToday}
            >
              Today
            </button>
            <button className="formatting-btn" onClick={handleNextWeek} style={{ borderRadius: 0, padding: '4px 8px' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#6b7280', marginRight: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#3b82f6' }} /> Meeting
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#8b5cf6' }} /> Auto-Scheduled Task
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} /> Focus Time
            </span>
          </div>

          <button className="toolbar-btn" onClick={runAutoSchedule}>
            <RefreshCw size={13} />
            <span>Rebalance</span>
          </button>

          <button
            className="btn-motion-new"
            style={{ width: 'auto', padding: '0 12px', height: '30px', margin: 0 }}
            onClick={() => openDialog('meeting')}
          >
            <Plus size={14} />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Days Header Row matching Screenshot 1 (EEST + | Sun 22 | Mon 23 | ...) */}
      <div className="motion-cal-header-row">
        <div style={{ width: '70px', padding: '10px 12px', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderRight: '1px solid var(--panel-border)', textAlign: 'right' }}>
          EEST +
        </div>

        {days.map((day, idx) => {
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div
              key={idx}
              className="motion-cal-header-cell"
              style={{ background: isToday ? '#fbfbfe' : '#ffffff' }}
            >
              <span style={{ color: isToday ? '#2563eb' : '#374151' }}>
                {day.toLocaleDateString([], { weekday: 'short' })}{' '}
                <span style={{ fontWeight: 700 }}>{day.getDate()}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Hour Grid matching Screenshot 1 */}
      <div>
        {hours.map((hour) => {
          return (
            <div key={hour} className="motion-cal-hour-row">
              <div className="motion-cal-hour-label">{formatHour(hour)}</div>

              {days.map((day, dayIdx) => {
                const dateStr = day.toISOString().split('T')[0];
                const eventsThisHour = state.events.filter((ev: CalendarEvent) => {
                  if (!ev.startTime.startsWith(dateStr)) return false;
                  const d = new Date(ev.startTime);
                  return d.getHours() === hour;
                });

                return (
                  <div key={dayIdx} className="motion-cal-day-col">
                    {eventsThisHour.map((ev: CalendarEvent) => {
                      const startD = new Date(ev.startTime);
                      const endD = new Date(ev.endTime);
                      const durationMins = Math.max(20, (endD.getTime() - startD.getTime()) / 60000);
                      const topOffset = (startD.getMinutes() / 60) * 58;
                      const height = Math.max(26, (durationMins / 60) * 58 - 2);

                      const task = ev.taskId ? state.tasks.find((t: TaskItem) => t.id === ev.taskId) : null;
                      const isDone = task?.status === 'done';

                      return (
                        <div
                          key={ev.id}
                          className={`motion-cal-block ${ev.type}`}
                          style={{
                            top: `${topOffset}px`,
                            height: `${height}px`,
                            opacity: isDone ? 0.6 : 1,
                          }}
                          onClick={() => setSelectedEvent(ev)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: isDone ? 'line-through' : 'none' }}>
                              {ev.title}
                            </span>
                            <span style={{ fontSize: '10px', opacity: 0.8 }} className="tabular-nums">
                              {Math.round(durationMins)}m
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="motion-drawer-overlay" onClick={() => setSelectedEvent(null)}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '20px',
              width: '100%',
              maxWidth: '440px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: selectedEvent.type === 'meeting' ? '#1e40af' : '#6b21a8',
                  background: selectedEvent.type === 'meeting' ? '#eff6ff' : '#f5f3ff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {selectedEvent.type === 'meeting' ? 'Fixed Meeting' : 'Auto-Scheduled Block'}
              </span>
              <button className="formatting-btn" onClick={() => setSelectedEvent(null)}>✕</button>
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              {selectedEvent.title}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280', marginBottom: '14px' }}>
              <Clock size={13} />
              <span>
                {new Date(selectedEvent.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} –{' '}
                {new Date(selectedEvent.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>

            {selectedEvent.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151', marginBottom: '12px' }}>
                <Video size={13} style={{ color: '#2563eb' }} />
                <span>{selectedEvent.location}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              {selectedEvent.taskId ? (
                <>
                  <button
                    className="toolbar-btn"
                    onClick={() => {
                      toggleTaskLock(selectedEvent.taskId!);
                      setSelectedEvent(null);
                    }}
                  >
                    <Lock size={13} />
                    <span>Lock / Unlock</span>
                  </button>
                  <button
                    className="btn-motion-new"
                    style={{ flex: 1, margin: 0, height: '32px' }}
                    onClick={() => {
                      toggleTaskStatus(selectedEvent.taskId!);
                      setSelectedEvent(null);
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark Complete</span>
                  </button>
                </>
              ) : (
                <button
                  className="toolbar-btn"
                  style={{ color: '#ef4444', width: '100%', justifyContent: 'center' }}
                  onClick={() => {
                    deleteEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                >
                  <Trash2 size={13} />
                  <span>Delete Event</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
