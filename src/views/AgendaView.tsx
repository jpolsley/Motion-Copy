import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertTriangle,
  Lock,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';

export default function AgendaView() {
  const { state, toggleTaskStatus, openDialog, setCurrentView } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks.filter((t) => t.status !== 'done');
  const currentTask = todayTasks[0];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '960px', margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>AI Agenda</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
            Your auto-scheduled focus blocks and commitments for today.
          </p>
        </div>

        <button
          className="btn-motion-new"
          style={{ width: 'auto', padding: '0 14px', height: '32px' }}
          onClick={() => openDialog('task')}
        >
          <Plus size={14} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Focus Hero Card */}
      {currentTask && (
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: '1px solid #bfdbfe',
            borderLeft: '4px solid #2563eb',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              <Sparkles size={13} />
              Current Focus
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {currentTask.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> {currentTask.durationMinutes}m block
              </span>
              <span>•</span>
              <span>Deadline: {currentTask.deadline || 'Today'}</span>
              <span>•</span>
              <span style={{ color: '#7c3aed', fontWeight: 600 }}>Auto-scheduled</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-motion-new"
              style={{ width: 'auto', padding: '0 16px', height: '34px', margin: 0 }}
              onClick={() => toggleTaskStatus(currentTask.id)}
            >
              <CheckCircle2 size={14} />
              <span>Mark Done</span>
            </button>
          </div>
        </div>
      )}

      {/* Next Up Sequence */}
      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
        Today's Schedule Sequence
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {state.tasks.map((task) => {
          const isDone = task.status === 'done';
          return (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                opacity: isDone ? 0.6 : 1,
              }}
            >
              <button
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => toggleTaskStatus(task.id)}
              >
                {isDone ? (
                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                ) : (
                  <Circle size={16} style={{ color: '#9ca3af' }} />
                )}
              </button>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#111827',
                    textDecoration: isDone ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </div>
                {task.description && (
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>
                    {task.description}
                  </div>
                )}
              </div>

              <span className="auto-scheduled-badge">
                ✦ {task.durationMinutes}m
              </span>

              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                {task.deadline}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
