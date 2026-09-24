import React from 'react';
import { BookOpen, CheckCircle2, Play, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TutorialsView() {
  const { setCurrentView, openDialog } = useApp();

  const tutorials = [
    {
      id: 1,
      title: 'How Motion Auto-Schedules Your Tasks',
      duration: '3 min',
      completed: true,
      description: 'Learn how tasks are placed in open calendar slots based on working hours, duration, and deadlines.',
    },
    {
      id: 2,
      title: 'Setting Up Your Booking Link',
      duration: '2 min',
      completed: false,
      description: 'Share your availability without double-booking. Meetings automatically push tasks forward.',
    },
    {
      id: 3,
      title: 'Deconstructing Projects with AI',
      duration: '4 min',
      completed: false,
      description: 'Describe goals in ordinary language and convert milestones directly into scheduled tasks.',
    },
    {
      id: 4,
      title: 'Resolving Workload Conflicts',
      duration: '2 min',
      completed: false,
      description: 'What happens when deadlines exceed working hours? 1-click realistic adjustments.',
    },
  ];

  return (
    <div style={{ padding: '24px 32px', maxWidth: '800px', margin: '0 auto', overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <BookOpen size={20} style={{ color: '#8b5cf6' }} />
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Getting Started with Motion</h1>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#8b5cf6', background: '#f5f3ff', padding: '2px 8px', borderRadius: '4px' }}>
            16% Completed
          </span>
        </div>
        <p style={{ fontSize: '13px', color: '#6b7280' }}>
          Interactive video walkthroughs to help you master automated scheduling and project management.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tutorials.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '16px 20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ marginTop: '2px' }}>
                {item.completed ? (
                  <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                ) : (
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #d1d5db' }} />
                )}
              </div>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{item.description}</p>
              </div>
            </div>

            <button
              className="toolbar-btn"
              onClick={() => {
                if (item.id === 1) setCurrentView('calendar');
                if (item.id === 2) setCurrentView('team-schedule');
                if (item.id === 3) openDialog('project');
                if (item.id === 4) openDialog('conflict-resolver');
              }}
            >
              <Play size={12} />
              <span>{item.duration}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
