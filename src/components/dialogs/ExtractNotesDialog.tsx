import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, CheckSquare, Calendar, Clock, Check, ArrowRight, User } from 'lucide-react';

export default function ExtractNotesDialog() {
  const { dialogOpen, dialogData, closeDialog, extractMeetingNotesWithAI, createTask, createEvent, addToast } = useApp();

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [selectedActions, setSelectedActions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (dialogOpen === 'extract-notes' && dialogData) {
      setExtractedData(null);
      setSelectedActions({});
      runExtraction(dialogData.content, dialogData.title);
    }
  }, [dialogOpen, dialogData]);

  if (dialogOpen !== 'extract-notes') return null;

  const runExtraction = async (content: string, title?: string) => {
    setIsExtracting(true);
    try {
      const result = await extractMeetingNotesWithAI(content, title);
      setExtractedData(result);
      // Select all actions by default
      const initial: Record<number, boolean> = {};
      (result.actionItems || []).forEach((_: any, idx: number) => {
        initial[idx] = true;
      });
      setSelectedActions(initial);
    } catch (err: any) {
      addToast(err.message || 'Failed to extract action items', true);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApply = () => {
    if (!extractedData) return;

    let appliedCount = 0;
    (extractedData.actionItems || []).forEach((item: any, idx: number) => {
      if (selectedActions[idx]) {
        createTask({
          title: item.taskTitle,
          description: `Extracted from note "${dialogData?.title || 'Meeting'}"`,
          durationMinutes: item.durationMinutes || 30,
          priority: item.priority || 'normal',
          deadline: item.deadline ? item.deadline.replace(/[^0-9-]/g, '') || undefined : undefined,
          assignee: item.owner || 'Me',
          projectId: dialogData?.projectId,
        });
        appliedCount++;
      }
    });

    addToast(`Extracted and scheduled ${appliedCount} task(s) into your calendar!`);
    closeDialog();
  };

  return (
    <div className="modal-overlay" onClick={closeDialog}>
      <div className="modal-content" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="logo-icon" style={{ width: '28px', height: '28px' }}>
              <Sparkles size={14} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>AI Note & Transcript Extractor</h2>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                Source: {dialogData?.title || 'Untitled Note'}
              </div>
            </div>
          </div>
          <button type="button" className="btn-icon" onClick={closeDialog}>✕</button>
        </div>

        <div className="modal-body">
          {isExtracting ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Sparkles size={28} style={{ color: 'var(--accent)', animation: 'spin 2s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Analyzing Transcript & Meeting Notes...</div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                Extracting executive decisions, tasks with owners & deadlines, and calendar blocks.
              </div>
            </div>
          ) : extractedData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Executive Summary */}
              {extractedData.summary && (
                <div style={{ background: 'var(--side)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', marginBottom: '4px' }}>
                    Executive Summary
                  </div>
                  <p style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.5' }}>
                    {extractedData.summary}
                  </p>
                </div>
              )}

              {/* Key Decisions */}
              {extractedData.keyDecisions && extractedData.keyDecisions.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', marginBottom: '6px' }}>
                    Key Decisions Made
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {extractedData.keyDecisions.map((dec: string, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#cbd5e1' }}>
                        <span style={{ color: 'var(--emerald)' }}>✓</span>
                        <span>{dec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Action Items */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
                    Review Action Items for Auto-Scheduling ({extractedData.actionItems?.length || 0})
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Select to add</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {extractedData.actionItems?.map((item: any, idx: number) => {
                    const isChecked = selectedActions[idx] !== false;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedActions((prev) => ({ ...prev, [idx]: !isChecked }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: isChecked ? 'var(--panel-hover)' : 'var(--side)',
                          border: isChecked ? '1px solid var(--panel-border)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                            {item.taskTitle}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', gap: '8px' }}>
                            <span>Owner: {item.owner || 'Me'}</span>
                            {item.deadline && <span>Due: {item.deadline}</span>}
                          </div>
                        </div>

                        <span className="status-pill normal tabular-nums">
                          {item.durationMinutes || 30}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px' }}>
              No content found in this note.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={closeDialog}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleApply}
            disabled={isExtracting || !extractedData}
          >
            <Check size={14} />
            <span>Apply Selected to Workspace & Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
}
