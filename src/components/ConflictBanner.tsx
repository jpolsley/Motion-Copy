import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

export default function ConflictBanner() {
  const { state, openDialog, resolveConflict } = useApp();
  const conflicts = state.conflicts;

  if (!conflicts.length) return null;

  const firstConflict = conflicts[0];

  return (
    <div className="conflict-banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <AlertTriangle size={16} style={{ color: '#f87171', flexShrink: 0 }} />
        <span>
          <strong>Schedule Conflict Detected:</strong> {conflicts.length} task{conflicts.length > 1 ? 's' : ''} cannot fit before {conflicts.length > 1 ? 'their deadlines' : 'deadline'}. (e.g. {firstConflict.taskTitle})
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn-secondary"
          style={{ padding: '3px 10px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fff' }}
          onClick={() => openDialog('conflict-resolver')}
        >
          Review & Resolve ({conflicts.length})
        </button>
      </div>
    </div>
  );
}
