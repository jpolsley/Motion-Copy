import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Calendar, Clock, CheckCircle2, AlertCircle, ArrowRight, X } from 'lucide-react';

export default function ProjectPlanDialog() {
  const { dialogOpen, closeDialog, generateProjectPlanWithAI, createProject, createTask, addToast, setCurrentView } = useApp();

  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  if (dialogOpen !== 'project-ai-template' && dialogOpen !== 'plan-project') return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsGenerating(true);
    try {
      const generated = await generateProjectPlanWithAI(goal.trim(), deadline);
      setPlan(generated);
    } catch (err: any) {
      addToast(err.message || 'Failed to generate project plan', true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveAndSchedule = () => {
    if (!plan) return;

    const project = createProject({
      name: plan.projectName || goal.slice(0, 30),
      description: plan.description || goal,
      color: '#4b5563',
      targetDate: deadline || new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
      milestones: (plan.milestones || []).map((m: any, idx: number) => ({
        id: `m-gen-${idx}`,
        title: m.title,
        deadlineDays: m.deadlineDays,
        completed: false,
      })),
    });

    let taskCount = 0;
    if (Array.isArray(plan.milestones)) {
      plan.milestones.forEach((milestone: any) => {
        if (Array.isArray(milestone.tasks)) {
          milestone.tasks.forEach((t: any) => {
            const taskDeadline = milestone.deadlineDays
              ? new Date(Date.now() + 86400000 * milestone.deadlineDays).toISOString().split('T')[0]
              : undefined;

            createTask(
              {
                title: t.title,
                description: `Part of phase: ${milestone.title}`,
                durationMinutes: t.durationMinutes || 30,
                priority: t.priority || 'medium',
                deadline: taskDeadline,
                projectId: project.id,
                assignee: 'Motion',
              },
              false
            );
            taskCount++;
          });
        }
      });
    }

    addToast(`Project "${project.name}" created with ${taskCount} auto-scheduled tasks!`);
    closeDialog();
    setPlan(null);
    setGoal('');
    setCurrentView('projects-tasks');
  };

  return (
    <div className="motion-drawer-overlay" onClick={closeDialog}>
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '640px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e5e7eb',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Create Project Template with AI</h2>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                Converts natural-language outcomes into milestones & auto-scheduled calendar blocks
              </div>
            </div>
          </div>
          <button className="formatting-btn" onClick={closeDialog}>
            <X size={16} />
          </button>
        </div>

        <div>
          {!plan ? (
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  Project Outcome / Workflow Description
                </label>
                <textarea
                  style={{ width: '100%', height: '100px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', fontSize: '13px', color: '#111827', outline: 'none' }}
                  placeholder="e.g. YouTube Video Launch workflow including scripting, B-roll shoot, audio mastering, thumbnail A/B testing, and description SEO..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', width: '200px' }}
                />
              </div>

              <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#4b5563' }}>
                💡 <strong>Motion Integration:</strong> Every generated task will be scheduled directly into open working hours on your calendar.
              </div>

              <button
                type="submit"
                className="btn-motion-new"
                style={{ width: '100%', height: '36px', margin: 0, background: 'linear-gradient(180deg, #8b5cf6 0%, #7c3aed 100%)' }}
                disabled={isGenerating}
              >
                <Sparkles size={14} />
                <span>{isGenerating ? 'Deconstructing Project Plan...' : 'Generate AI Project Template'}</span>
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{plan.projectName}</h3>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{plan.description}</p>
              </div>

              {plan.assumptions && plan.assumptions.length > 0 && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                    ASSUMPTIONS FOR YOUR REVIEW:
                  </div>
                  <ul style={{ paddingLeft: '16px', fontSize: '11px', color: '#1e3a8a', lineHeight: '1.5' }}>
                    {plan.assumptions.map((a: string, i: number) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plan.milestones?.map((m: any, mIdx: number) => (
                  <div key={mIdx} style={{ background: '#f9fafb', borderRadius: '6px', padding: '10px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                      {m.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {m.tasks?.map((t: any, tIdx: number) => (
                        <div key={tIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#374151', padding: '2px 0' }}>
                          <span>• {t.title}</span>
                          <span style={{ color: '#6b7280', fontSize: '11px' }}>{t.durationMinutes}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button className="toolbar-btn" onClick={() => setPlan(null)}>
                  Back
                </button>
                <button
                  className="btn-motion-new"
                  style={{ flex: 1, margin: 0, height: '34px' }}
                  onClick={handleApproveAndSchedule}
                >
                  <Calendar size={14} />
                  <span>Create Project & Auto-Schedule into Calendar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
