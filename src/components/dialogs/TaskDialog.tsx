import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Puzzle,
  Repeat,
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
  Plus,
  Box,
  Folder,
  Sparkles,
  Calendar,
  Clock,
  Flag,
  Trash2,
  X,
  Bell,
  BellOff,
  Tag,
} from 'lucide-react';
import { TaskPriority, TaskStatus } from '../../types';

export default function TaskDialog() {
  const { dialogOpen, dialogData, closeDialog, createTask, updateTask, deleteTask, state, addToast } = useApp();

  const isEditing = Boolean(dialogData?.id);

  // Core properties
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');

  // Metadata properties (all editable)
  const [workspace, setWorkspace] = useState('My Private Workspace');
  const [folder, setFolder] = useState('No folder');
  const [projectId, setProjectId] = useState('');
  const [assignee, setAssignee] = useState('Motion');
  const [minChunk, setMinChunk] = useState('No Chunks');

  // Start date state (supports quick presets & custom date)
  const [startDatePreset, setStartDatePreset] = useState<'Today' | 'Tomorrow' | 'Next Monday' | 'custom'>('Today');
  const [customStartDate, setCustomStartDate] = useState('');

  // Deadline state
  const [deadline, setDeadline] = useState('');
  const [hardDeadline, setHardDeadline] = useState(false);
  const [deadlineAlert, setDeadlineAlert] = useState(true);

  // Schedule type
  const [scheduleType, setScheduleType] = useState('Work hours');

  // Labels
  const [labels, setLabels] = useState<string[]>([]);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');

  // Custom Fields
  const [customFields, setCustomFields] = useState<Array<{ id: string; name: string; value: string }>>([]);

  useEffect(() => {
    if (dialogData && isEditing) {
      setTitle(dialogData.title || '');
      setDescription(dialogData.description || '');
      setDurationMinutes(dialogData.durationMinutes || 30);
      setPriority(dialogData.priority || 'medium');
      setStatus(dialogData.status || 'todo');
      setWorkspace(dialogData.workspace || 'My Private Workspace');
      setFolder(dialogData.folder || 'No folder');
      setProjectId(dialogData.projectId || state.projects[0]?.id || '');
      setAssignee(dialogData.assignee || 'Motion');
      setMinChunk(dialogData.minChunk || 'No Chunks');

      // Start date
      if (dialogData.startDate === 'Tomorrow') {
        setStartDatePreset('Tomorrow');
      } else if (dialogData.startDate === 'Next Monday') {
        setStartDatePreset('Next Monday');
      } else if (dialogData.startDate && dialogData.startDate !== 'Today') {
        setStartDatePreset('custom');
        setCustomStartDate(dialogData.startDate);
      } else {
        setStartDatePreset('Today');
      }

      setDeadline(dialogData.deadline || '2026-10-02');
      setHardDeadline(dialogData.hardDeadline || false);
      setScheduleType(dialogData.scheduleType || 'Work hours');
      setLabels(dialogData.labels || []);
      setCustomFields(dialogData.customFields || []);
    } else {
      setTitle('');
      setDescription('');
      setDurationMinutes(30);
      setPriority('medium');
      setStatus('todo');
      setWorkspace('My Private Workspace');
      setFolder('No folder');
      setProjectId(state.projects[0]?.id || '');
      setAssignee('Motion');
      setMinChunk('No Chunks');
      setStartDatePreset('Today');
      setCustomStartDate('');
      setDeadline('2026-10-02');
      setHardDeadline(false);
      setScheduleType('Work hours');
      setLabels([]);
      setCustomFields([]);
    }
  }, [dialogData, isEditing, dialogOpen, state.projects]);

  if (dialogOpen !== 'task') return null;

  const getEffectiveStartDate = () => {
    if (startDatePreset === 'custom') {
      return customStartDate || 'Today';
    }
    return startDatePreset;
  };

  const handleAddLabel = (label: string) => {
    const trimmed = label.trim();
    if (!trimmed || labels.includes(trimmed)) return;
    setLabels([...labels, trimmed]);
    setNewLabelText('');
    setShowAddLabel(false);
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter((l) => l !== labelToRemove));
  };

  const handleAddCustomField = () => {
    const newField = {
      id: 'cf-' + Date.now().toString(36),
      name: 'Field ' + (customFields.length + 1),
      value: '',
    };
    setCustomFields([...customFields, newField]);
  };

  const handleUpdateCustomField = (id: string, name: string, value: string) => {
    setCustomFields(
      customFields.map((f) => (f.id === id ? { ...f, name, value } : f))
    );
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskPayload = {
      title: title.trim(),
      description: description.trim(),
      durationMinutes,
      priority,
      status,
      workspace,
      folder,
      projectId,
      assignee,
      minChunk,
      startDate: getEffectiveStartDate(),
      deadline,
      hardDeadline,
      scheduleType,
      labels,
      customFields,
    };

    if (isEditing) {
      updateTask(dialogData.id, taskPayload);
    } else {
      createTask(taskPayload);
    }
    closeDialog();
  };

  // Helper for Assignee avatar badge
  const getAssigneeAvatar = (name: string) => {
    if (name === 'Motion') return { text: 'M', bg: '#10b981' };
    if (name === 'Me') return { text: 'ME', bg: '#2563eb' };
    if (name.startsWith('Sarah')) return { text: 'S', bg: '#8b5cf6' };
    if (name.startsWith('Alex')) return { text: 'A', bg: '#f59e0b' };
    return { text: name.slice(0, 1).toUpperCase(), bg: '#6b7280' };
  };

  const currentAvatar = getAssigneeAvatar(assignee);

  return (
    <div className="motion-drawer-overlay" onClick={closeDialog}>
      <div
        className="motion-task-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Main Content */}
        <div className="task-drawer-main">
          {/* Top meta strip */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
              <CheckSquare size={15} style={{ color: '#2563eb' }} />
              <span>Task</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                className="formatting-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => addToast('Template options loaded')}
              >
                <Puzzle size={13} />
                <span>Use template</span>
              </button>
              <button
                type="button"
                className="formatting-btn"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => addToast('Recurring rule applied: Weekly')}
              >
                <Repeat size={13} />
                <span>Recurring</span>
              </button>
              <button type="button" className="formatting-btn" onClick={closeDialog}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Task Name Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task name"
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

          {/* Rich Text Toolbar matching Screenshot 2 */}
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

          {/* Description area */}
          <div style={{ flex: 1 }}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              style={{
                width: '100%',
                height: '100%',
                minHeight: '220px',
                border: 'none',
                outline: 'none',
                resize: 'none',
                fontSize: '13px',
                lineHeight: '1.6',
                color: '#374151',
              }}
            />
          </div>

          {/* Attachments Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Attachments</span>
            <button
              type="button"
              className="formatting-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}
              onClick={() => addToast('Select files to attach')}
            >
              <Plus size={13} />
              <span>Add attachment</span>
            </button>
          </div>
        </div>

        {/* Right Metadata Column matching Screenshot 2 with ALL editable properties */}
        <div className="task-drawer-meta">
          {/* Workspace, Folder, and Project Selectors (ALL EDITABLE) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '12px', borderBottom: '1px solid #e5e7eb' }}>
            {/* 1. Workspace dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151' }}>
              <Box size={14} style={{ color: '#4b5563', flexShrink: 0 }} />
              <select
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  padding: '1px 0',
                }}
              >
                <option value="My Private Workspace">My Private Workspace</option>
                <option value="YouTube Video Launch Workspace">YouTube Video Launch Workspace</option>
                <option value="Launching a blogpost">Launching a blogpost</option>
                <option value="My Workspace">My Workspace</option>
              </select>
            </div>

            {/* 2. Folder dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
              <Folder size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <select
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: '#4b5563',
                  fontSize: '12px',
                  cursor: 'pointer',
                  width: '100%',
                  padding: '1px 0',
                }}
              >
                <option value="No folder">No folder</option>
                <option value="Video editing">Video editing</option>
                <option value="Motion Tutorial Video">Motion Tutorial Video</option>
                <option value="Motion AI review">Motion AI review</option>
                <option value="Agenda">Agenda</option>
                <option value="Thumbnails">Thumbnails</option>
              </select>
            </div>

            {/* 3. Project dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
              <Box size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: '#111827',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  width: '100%',
                  padding: '1px 0',
                }}
              >
                <option value="">No project</option>
                {state.projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Purple Auto-scheduled Banner */}
          <div className="auto-scheduled-banner">
            <Sparkles size={14} />
            <span>Auto-scheduled (Pending)</span>
          </div>

          {/* Metadata Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 4. Assignee (EDITABLE) */}
            <div className="meta-field-row">
              <span className="meta-field-label">Assignee:</span>
              <div className="meta-field-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    background: currentAvatar.bg,
                    color: '#fff',
                    fontSize: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {currentAvatar.text}
                </span>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontWeight: 500,
                    color: '#111827',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  <option value="Motion">Motion</option>
                  <option value="Me">Me</option>
                  <option value="Sarah Chen">Sarah Chen</option>
                  <option value="Alex Rivera">Alex Rivera</option>
                  <option value="Engineering Team">Engineering Team</option>
                </select>
              </div>
            </div>

            {/* 5. Status (EDITABLE) */}
            <div className="meta-field-row">
              <span className="meta-field-label">Status:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontWeight: 500,
                  color: '#111827',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <option value="todo">⭕ Todo</option>
                <option value="in_progress">🟡 In Progress</option>
                <option value="done">🟢 Done</option>
              </select>
            </div>

            {/* 6. Priority (EDITABLE) */}
            <div className="meta-field-row">
              <span className="meta-field-label">Priority:</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontWeight: 500,
                  color: '#111827',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <option value="urgent">🚩 Urgent</option>
                <option value="high">🚩 High</option>
                <option value="medium">🚩 Medium</option>
                <option value="low">🚩 Low</option>
              </select>
            </div>

            {/* 7. Duration (EDITABLE) */}
            <div className="meta-field-row">
              <span className="meta-field-label">Duration:</span>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontWeight: 500,
                  color: '#111827',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>

            {/* 8. Min chunk (EDITABLE) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', paddingLeft: '10px' }}>
              <span>↳ Min chunk:</span>
              <select
                value={minChunk}
                onChange={(e) => setMinChunk(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  color: '#4b5563',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <option value="No Chunks">No Chunks</option>
                <option value="15 min">15 min</option>
                <option value="30 min">30 min</option>
                <option value="45 min">45 min</option>
                <option value="1 hour">1 hour</option>
              </select>
            </div>

            {/* 9. Start date (EDITABLE - CIRCLED IN SCREENSHOT) */}
            <div className="meta-field-row" style={{ alignItems: 'flex-start' }}>
              <span className="meta-field-label" style={{ paddingTop: '3px' }}>Start date:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <select
                    value={startDatePreset}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setStartDatePreset(val);
                      if (val === 'custom' && !customStartDate) {
                        setCustomStartDate(new Date().toISOString().split('T')[0]);
                      }
                    }}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '5px',
                      padding: '2px 6px',
                      background: '#ffffff',
                      color: '#111827',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="Today">📅 Today</option>
                    <option value="Tomorrow">📅 Tomorrow</option>
                    <option value="Next Monday">📅 Next Monday</option>
                    <option value="custom">📅 Custom Date...</option>
                  </select>
                </div>

                {startDatePreset === 'custom' && (
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      fontSize: '11px',
                      background: '#ffffff',
                      color: '#111827',
                      outline: 'none',
                    }}
                  />
                )}
              </div>
            </div>

            {/* 10. Deadline (EDITABLE) */}
            <div className="meta-field-row">
              <span className="meta-field-label">Deadline:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    background: '#ffffff',
                    color: '#111827',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setDeadlineAlert(!deadlineAlert)}
                  title={deadlineAlert ? 'Alert notifications enabled' : 'Alert notifications muted'}
                  style={{
                    border: '1px solid #e5e7eb',
                    background: deadlineAlert ? '#eff6ff' : '#ffffff',
                    borderRadius: '4px',
                    padding: '3px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: deadlineAlert ? '#2563eb' : '#9ca3af',
                  }}
                >
                  {deadlineAlert ? <Bell size={12} /> : <BellOff size={12} />}
                </button>
              </div>
            </div>

            {/* 11. Hard deadline (EDITABLE TOGGLE SWITCH) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', paddingLeft: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>↳ Hard deadline:</span>
                <span title="Hard deadlines will strictly force scheduling before date even if other items are bumped" style={{ cursor: 'help', color: '#9ca3af' }}>ⓘ</span>
              </span>
              <label style={{ position: 'relative', display: 'inline-block', width: '28px', height: '16px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={hardDeadline}
                  onChange={(e) => setHardDeadline(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: hardDeadline ? '#2563eb' : '#d1d5db',
                    borderRadius: '16px',
                    transition: '0.2s',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      height: '12px',
                      width: '12px',
                      left: hardDeadline ? '14px' : '2px',
                      bottom: '2px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.2s',
                    }}
                  />
                </span>
              </label>
            </div>

            {/* 12. Schedule (EDITABLE) */}
            <div className="meta-field-row">
              <span className="meta-field-label">Schedule:</span>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontWeight: 500,
                  color: '#111827',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <option value="Work hours">⏰ Work hours</option>
                <option value="Personal hours">🌙 Personal hours</option>
                <option value="Any time">⚡ Any time</option>
                <option value="Weekends only">🏖️ Weekends only</option>
              </select>
            </div>

            {/* 13. Labels (EDITABLE) */}
            <div className="meta-field-row" style={{ alignItems: 'flex-start' }}>
              <span className="meta-field-label" style={{ paddingTop: '2px' }}>Labels:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', maxWidth: '170px' }}>
                {labels.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                    {labels.map((lbl) => (
                      <span
                        key={lbl}
                        style={{
                          background: '#f3f4f6',
                          color: '#374151',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        {lbl}
                        <button
                          type="button"
                          onClick={() => handleRemoveLabel(lbl)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#9ca3af' }}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>None</span>
                )}

                {showAddLabel ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                    <input
                      type="text"
                      placeholder="Label name"
                      value={newLabelText}
                      onChange={(e) => setNewLabelText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLabel(newLabelText);
                        }
                      }}
                      autoFocus
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        padding: '1px 4px',
                        fontSize: '11px',
                        width: '90px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddLabel(newLabelText)}
                      style={{
                        border: 'none',
                        background: '#2563eb',
                        color: '#fff',
                        borderRadius: '3px',
                        padding: '1px 5px',
                        fontSize: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddLabel(false)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '11px', color: '#9ca3af' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddLabel(true)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#2563eb',
                      fontSize: '11px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    + Add label
                  </button>
                )}
              </div>
            </div>

            {/* 14. Custom Fields (EDITABLE) */}
            {customFields.map((field) => (
              <div key={field.id} className="meta-field-row" style={{ gap: '6px' }}>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleUpdateCustomField(field.id, e.target.value, field.value)}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    fontSize: '11px',
                    color: '#6b7280',
                    width: '80px',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <input
                    type="text"
                    value={field.value}
                    placeholder="Value"
                    onChange={(e) => handleUpdateCustomField(field.id, field.name, e.target.value)}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '2px 4px',
                      fontSize: '11px',
                      width: '100%',
                      color: '#111827',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(field.id)}
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: '12px' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              className="formatting-btn"
              style={{ justifyContent: 'flex-start', padding: '4px 0', color: '#6b7280' }}
              onClick={handleAddCustomField}
            >
              <Plus size={13} />
              <span>Add custom field</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <button
              type="button"
              className="btn-motion-new"
              style={{ width: '100%', height: '34px', margin: 0 }}
              onClick={handleSubmit}
            >
              {isEditing ? 'Save Task' : 'Schedule Task'}
            </button>

            {isEditing && (
              <button
                type="button"
                className="toolbar-btn"
                style={{ width: '100%', justifyContent: 'center', color: '#ef4444' }}
                onClick={() => {
                  deleteTask(dialogData.id);
                  closeDialog();
                }}
              >
                <Trash2 size={13} />
                <span>Delete Task</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
