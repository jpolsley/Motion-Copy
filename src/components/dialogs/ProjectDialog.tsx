import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  ChevronDown,
  Sparkles,
  Puzzle,
  Box,
  Folder,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Calendar,
  Flag,
  Plus,
  X,
  Edit2,
  Check,
} from 'lucide-react';
import { ProjectItem, ProjectStatus, TaskPriority } from '../../types';

export default function ProjectDialog() {
  const { dialogOpen, dialogData, closeDialog, createProject, updateProject, openDialog } = useApp();

  const isEditing = Boolean(dialogData?.id);
  const [step, setStep] = useState<'chooser' | 'scratch'>(isEditing ? 'scratch' : 'chooser');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<ProjectStatus>('open');
  const [assignee, setAssignee] = useState('ES');
  const [startDate, setStartDate] = useState('2026-09-15');
  const [deadline, setDeadline] = useState('2026-10-15');
  const [workspace, setWorkspace] = useState('My Private Workspace');
  const [folder, setFolder] = useState('Video editing');
  const [color, setColor] = useState('#4b5563');

  useEffect(() => {
    if (dialogData?.id) {
      setStep('scratch');
      setName(dialogData.name || '');
      setDescription(dialogData.description || '');
      setPriority(dialogData.priority || 'medium');
      setStatus(dialogData.status || 'open');
      setAssignee(dialogData.assignee || 'ES');
      setStartDate(dialogData.startDate || '2026-09-15');
      setDeadline(dialogData.targetDate || '2026-10-15');
      setWorkspace(dialogData.workspace || 'My Private Workspace');
      setFolder(dialogData.folder || 'Video editing');
      setColor(dialogData.color || '#4b5563');
    } else {
      setStep('chooser');
      setName('');
      setDescription('');
      setPriority('medium');
      setStatus('open');
      setAssignee('ES');
      setStartDate('2026-09-15');
      setDeadline('2026-10-15');
      setWorkspace('My Private Workspace');
      setFolder('No folder');
      setColor('#4b5563');
    }
  }, [dialogData, dialogOpen]);

  if (dialogOpen !== 'project') return null;

  const handleStartScratch = () => {
    setName('YouTube Video Launch');
    setDescription('');
    setStep('scratch');
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && dialogData?.id) {
      updateProject(dialogData.id, {
        name: name.trim(),
        description: description.trim(),
        priority,
        status,
        assignee,
        startDate,
        targetDate: deadline,
        workspace,
        folder,
        color,
      });
    } else {
      createProject({
        name: name.trim(),
        description: description.trim(),
        priority,
        status,
        assignee,
        startDate,
        targetDate: deadline,
        workspace,
        folder,
        color,
      });
    }
    closeDialog();
  };

  return (
    <div className="motion-drawer-overlay" onClick={closeDialog}>
      {step === 'chooser' ? (
        /* Choose Template / Scratch Modal */
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '780px',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e5e7eb',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Create project</h2>
            <button className="formatting-btn" onClick={closeDialog}>
              <X size={16} />
            </button>
          </div>

          {/* Search bar & Workspace dropdown */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '0 10px',
                height: '34px',
              }}
            >
              <Search size={14} style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Search templates"
                style={{ border: 'none', outline: 'none', fontSize: '13px', width: '100%' }}
              />
            </div>

            <button
              className="toolbar-btn"
              style={{ height: '34px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Box size={14} style={{ color: '#4b5563' }} />
              <span>All workspaces</span>
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Top 2 Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            {/* Card 1: AI Template */}
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#ffffff',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, color: '#8b5cf6' }}>
                  <Puzzle size={16} />
                  <span>Create Project Template with AI</span>
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', lineHeight: '1.5' }}>
                  Create a template for all projects with similar workflows.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  closeDialog();
                  openDialog('project-ai-template');
                }}
                style={{
                  marginTop: '16px',
                  background: '#8b5cf6',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                Create Project Template with AI
              </button>
            </div>

            {/* Card 2: From Scratch */}
            <div
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#ffffff',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                  Create Project from Scratch
                </div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', lineHeight: '1.5' }}>
                  Create a project manually from scratch.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartScratch}
                style={{
                  marginTop: '16px',
                  background: '#f3f4f6',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: 'fit-content',
                }}
              >
                Create project from scratch
              </button>
            </div>
          </div>

          {/* Section: Create from Template */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
              <Puzzle size={14} />
              <span>Create from Template</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  createProject({
                    name: 'Blog Post Announcement Procedure',
                    description: 'Drafting announcement blogpost for new AI features.',
                    color: '#2563eb',
                  });
                  closeDialog();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Puzzle size={12} /> Launching a blogpost
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Edit2 size={11} /> Edit
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginTop: '8px' }}>
                  Blog Post Announcement Procedure
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                  Standard draft, review, and social publishing procedure
                </div>
              </div>

              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  createProject({
                    name: 'YouTube Video Review Process',
                    description: 'Standard checklist for recording, editing, and thumbnail design.',
                    color: '#4b5563',
                  });
                  closeDialog();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Puzzle size={12} /> My Private Workspace
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginTop: '8px' }}>
                  YouTube Video Review Process
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                  Screen captures, audio master, thumbnail A/B testing
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Accurate Scratch / Project Info Editor Drawer */
        <div
          className="motion-task-drawer"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Left Column */}
          <div className="task-drawer-main">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280' }}>
                <Box size={16} />
                <span>{isEditing ? 'Edit Project' : 'New Project'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="formatting-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Puzzle size={13} />
                  <span>Use template</span>
                </button>
                <button type="button" className="formatting-btn" onClick={closeDialog}>
                  <X size={16} />
                </button>
              </div>
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              autoFocus
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#111827',
                border: 'none',
                outline: 'none',
                width: '100%',
                marginBottom: '16px',
              }}
            />

            {/* Rich Text Toolbar */}
            <div className="formatting-toolbar">
              <button type="button" className="formatting-btn"><Bold size={13} /></button>
              <button type="button" className="formatting-btn"><Italic size={13} /></button>
              <button type="button" className="formatting-btn"><Underline size={13} /></button>
              <button type="button" className="formatting-btn"><Strikethrough size={13} /></button>
              <div style={{ width: '1px', height: '14px', background: '#e5e7eb', margin: '0 2px' }} />
              <button type="button" className="formatting-btn"><Heading1 size={13} /></button>
              <button type="button" className="formatting-btn"><Heading2 size={13} /></button>
              <div style={{ width: '1px', height: '14px', background: '#e5e7eb', margin: '0 2px' }} />
              <button type="button" className="formatting-btn"><List size={13} /></button>
              <button type="button" className="formatting-btn"><ListOrdered size={13} /></button>
              <button type="button" className="formatting-btn"><Quote size={13} /></button>
              <button type="button" className="formatting-btn"><Code size={13} /></button>
              <button type="button" className="formatting-btn"><Link2 size={13} /></button>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project documentation, goals, and workflow description..."
              style={{
                width: '100%',
                flex: 1,
                minHeight: '260px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#374151',
              }}
            />
          </div>

          {/* Right Panel with ALL EDITABLE PROPERTIES */}
          <div className="task-drawer-meta">
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>
              Workspace & Folder
            </div>

            {/* Workspace Select */}
            <select
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '4px 6px',
                background: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="My Private Workspace">My Private Workspace</option>
              <option value="YouTube Video Launch Workspace">YouTube Video Launch Workspace</option>
              <option value="Launching a blogpost">Launching a blogpost</option>
            </select>

            {/* Folder Select */}
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              style={{
                fontSize: '12px',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '4px 6px',
                background: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="Video editing">Video editing</option>
              <option value="No folder">No folder</option>
              <option value="Production">Production</option>
              <option value="Marketing">Marketing</option>
            </select>

            <div style={{ height: '1px', background: '#e5e7eb', margin: '4px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Assignee */}
              <div className="meta-field-row">
                <span className="meta-field-label">Assignee:</span>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    background: '#ffffff',
                  }}
                >
                  <option value="ES">Ethan (ES)</option>
                  <option value="Motion">Motion (M)</option>
                </select>
              </div>

              {/* Status */}
              <div className="meta-field-row">
                <span className="meta-field-label">Status:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    background: '#ffffff',
                  }}
                >
                  <option value="open">🟢 Open</option>
                  <option value="in_progress">🔵 In Progress</option>
                  <option value="completed">✅ Completed</option>
                  <option value="on_hold">⏸ On Hold</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="meta-field-row">
                <span className="meta-field-label">Start date:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '1px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Deadline */}
              <div className="meta-field-row">
                <span className="meta-field-label">Deadline:</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{ border: '1px solid #e5e7eb', borderRadius: '4px', padding: '1px 4px', fontSize: '11px' }}
                />
              </div>

              {/* Priority */}
              <div className="meta-field-row">
                <span className="meta-field-label">Priority:</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    background: '#ffffff',
                  }}
                >
                  <option value="urgent">🚩 Urgent</option>
                  <option value="high">🚩 High</option>
                  <option value="medium">🚩 Medium</option>
                  <option value="normal">🚩 Normal</option>
                  <option value="low">🚩 Low</option>
                </select>
              </div>

              {/* Color */}
              <div className="meta-field-row">
                <span className="meta-field-label">Color:</span>
                <select
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    background: '#ffffff',
                  }}
                >
                  <option value="#4b5563">⬛ Gray</option>
                  <option value="#2563eb">🟦 Blue</option>
                  <option value="#8b5cf6">🟪 Purple</option>
                  <option value="#10b981">🟩 Green</option>
                  <option value="#f59e0b">🟧 Orange</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <button
                type="button"
                className="btn-motion-new"
                style={{ width: '100%', margin: 0 }}
                onClick={handleSaveProject}
              >
                {isEditing ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
