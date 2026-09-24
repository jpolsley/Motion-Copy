import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Clock, Calendar, Check, ArrowRight } from 'lucide-react';

export default function ConflictResolverDialog() {
  const { dialogOpen, closeDialog, state, resolveConflict } = useApp();

  if (dialogOpen !== 'conflict-resolver') return null;

  const conflicts = state.conflicts;

  return (
    <div className="modal-overlay" onClick={closeDialog}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="logo-icon" style={{ width: '28px', height: '28px', background: 'var(--rose)' }}>
              <AlertTriangle size={15} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                Schedule Conflict Resolution
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {conflicts.length} task{conflicts.length > 1 ? 's' : ''} cannot fit realistically before their deadline
              </div>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={closeDialog}>✕</button>
        </div>

        <div className="modal-body">
          {conflicts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Check size={20} style={{ color: 'var(--emerald)' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>All Conflicts Resolved!</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '4px' }}>
                Your workload and deadlines now fit realistically within your available working hours.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Motion prevents "magical thinking" by refusing to create impossible schedules. Review each conflict and choose a realistic adjustment below:
              </div>

              {conflicts.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: 'var(--side)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{c.taskTitle}</h4>
                      <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '3px' }}>
                        {c.explanation}
                      </div>
                    </div>
                    <span className="status-pill urgent tabular-nums">
                      +{Math.round(c.deficitMinutes / 60)}h late
                    </span>
                  </div>

                  {/* Resolution action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <button
                      className="btn-secondary"
                      style={{ justifyContent: 'space-between', fontSize: '11px', padding: '6px 10px' }}
                      onClick={() => resolveConflict(c.id, 'extend')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} style={{ color: 'var(--accent)' }} />
                        Extend deadline by 2 business days
                      </span>
                      <ArrowRight size={12} />
                    </button>

                    <button
                      className="btn-secondary"
                      style={{ justifyContent: 'space-between', fontSize: '11px', padding: '6px 10px' }}
                      onClick={() => resolveConflict(c.id, 'shorten')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} style={{ color: 'var(--amber)' }} />
                        Compress estimated duration by 50%
                      </span>
                      <ArrowRight size={12} />
                    </button>

                    <button
                      className="btn-secondary"
                      style={{ justifyContent: 'space-between', fontSize: '11px', padding: '6px 10px' }}
                      onClick={() => resolveConflict(c.id, 'urgent')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={12} style={{ color: 'var(--rose)' }} />
                        Elevate to 'Urgent' priority to preempt lower priority tasks
                      </span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={closeDialog}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
