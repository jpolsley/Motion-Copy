import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Box,
  MoreHorizontal,
  Info,
  BarChart2,
  Folder,
  Edit2,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  User,
  SlidersHorizontal,
  FileText,
  CornerDownLeft,
  X,
} from 'lucide-react';
import { TaskItem } from '../types';

export default function ProjectsTasksView() {
  const {
    state,
    selectedProjectId,
    setSelectedProjectId,
    openDialog,
    createTask,
    toggleTaskStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'navigate' | 'tasklist'>('tasklist');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [groupExpanded, setGroupExpanded] = useState(true);
  const [showResolved, setShowResolved] = useState(true);
  const [onlyPastDeadline, setOnlyPastDeadline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Inline task creation state
  const [quickTitle, setQuickTitle] = useState('');
  const [isAddingInline, setIsAddingInline] = useState(false);

  const currentProject =
    state.projects.find((p) => p.id === selectedProjectId) || state.projects[0];

  const projectTasks = state.tasks.filter((t) => {
    if (selectedProjectId && t.projectId !== selectedProjectId) return false;
    if (!showResolved && t.status === 'done') return false;
    if (searchQuery.trim()) {
      return t.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    createTask({
      title: quickTitle.trim(),
      projectId: currentProject?.id,
      durationMinutes: 30,
      priority: 'medium',
      assignee: 'Motion',
      deadline: '2026-10-05',
    });
    setQuickTitle('');
    setIsAddingInline(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 1. Top Header (Breadcrumb, Project Name, Status, Actions) */}
      <div className="view-top-header">
        <div className="project-title-area">
          <Box size={16} style={{ color: '#4b5563' }} />
          <span className="project-title-text">{currentProject?.name || 'YouTube Video Launch'}</span>
          <span className="badge-open">Open</span>
          <button
            className="formatting-btn"
            style={{ padding: '2px 4px' }}
            onClick={() => openDialog('project', currentProject)}
            title="Project settings"
          >
            <MoreHorizontal size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="toolbar-btn"
            onClick={() => openDialog('project', currentProject)}
          >
            <Info size={13} style={{ color: '#6b7280' }} />
            <span>Project info</span>
          </button>

          <button
            className="toolbar-btn"
            style={{ borderColor: '#d1d5db' }}
            onClick={() => openDialog('project-ai-template')}
          >
            <BarChart2 size={13} style={{ color: '#6b7280' }} />
            <span>Create Dashboard</span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                color: '#8b5cf6',
                background: '#f5f3ff',
                padding: '1px 4px',
                borderRadius: '3px',
              }}
            >
              NEW
            </span>
          </button>
        </div>
      </div>

      {/* 2. Subnav Tabs (Navigate | Task List ⋮ | ✏️ +) */}
      <div
        style={{
          height: '38px',
          borderBottom: '1px solid var(--panel-border)',
          padding: '0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
        }}
      >
        <div className="header-nav-tabs">
          <button
            className={`header-tab ${activeTab === 'navigate' ? 'active' : ''}`}
            onClick={() => setActiveTab('navigate')}
          >
            <Folder size={13} />
            <span>Navigate</span>
          </button>

          <button
            className={`header-tab ${activeTab === 'tasklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasklist')}
          >
            <span>Task List</span>
            <MoreHorizontal size={12} />
          </button>

          <button className="header-tab" title="Rename or edit tab">
            <Edit2 size={12} />
          </button>

          <button className="header-tab" title="Add view">
            <Plus size={13} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
          <Search size={13} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: '12px', width: '100px' }}
          />
        </div>
      </div>

      {/* 3. Table Toolbar (Group by, Sort, List/Kanban, Filters, Task count) */}
      <div className="table-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-btn">
            <Box size={13} style={{ color: '#3b82f6' }} />
            <span>Group by: Project › Task</span>
            <ChevronDown size={11} />
          </div>

          <button className="toolbar-btn">
            <span>Sort Groups</span>
          </button>

          {/* List vs Kanban Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
          </div>

          <button className="toolbar-btn">
            <span>Sort Tasks</span>
          </button>

          <button className="toolbar-btn">
            <span>▶ Filters (0)</span>
          </button>
        </div>

        <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.04em' }}>
          TASKS: {projectTasks.length}
        </div>
      </div>

      {/* 4. Sub-bar Checkboxes */}
      <div className="table-sub-controls">
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={onlyPastDeadline}
            onChange={(e) => setOnlyPastDeadline(e.target.checked)}
            style={{ accentColor: '#2563eb' }}
          />
          <span>Only show scheduled past deadline</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            style={{ accentColor: '#2563eb' }}
          />
          <span>Show resolved tasks</span>
        </label>
      </div>

      {/* 5. Main Content: Empty State (Screenshot 5) or Task Table (Screenshot 6) */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {projectTasks.length === 0 && !isAddingInline ? (
          /* Empty State matching Screenshot 5 */
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <FileText size={32} style={{ color: '#93c5fd' }} />
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>No tasks yet</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: '18px' }}>
              Add your first task below!
            </p>
            <button
              className="btn-motion-new"
              style={{ width: 'auto', padding: '0 18px', height: '32px' }}
              onClick={() => openDialog('task')}
            >
              Add Task
            </button>
          </div>
        ) : (
          /* Motion Task Table matching Screenshot 6 */
          <table className="motion-table">
            <thead>
              <tr>
                <th style={{ width: '280px' }}>NAME</th>
                <th style={{ width: '130px' }}>ETA</th>
                <th style={{ width: '110px' }}>ASSIGNEE</th>
                <th style={{ width: '140px' }}>PROJECT</th>
                <th style={{ width: '110px' }}>COMPLETED AT</th>
                <th style={{ width: '80px' }}>DURAT...</th>
                <th style={{ width: '110px' }}>DEADLINE</th>
                <th style={{ width: '70px' }}>COMPL...</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {/* Project Group Header Row */}
              <tr className="group-row">
                <td colSpan={9}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                      onClick={() => setGroupExpanded(!groupExpanded)}
                    >
                      {groupExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                    <Box size={14} style={{ color: '#4b5563' }} />
                    <span>
                      {currentProject?.name} (Project) {projectTasks.length}
                    </span>
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#8b5cf6',
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: '12px' }}>🚀</span>
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 500, color: '#4b5563', fontSize: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} /> Motion
                      </span>
                      <span>1h</span>
                      <span>Mon Sep 29</span>
                    </span>
                  </div>
                </td>
              </tr>

              {/* Task Rows */}
              {groupExpanded &&
                projectTasks.map((task, idx) => {
                  const isDone = task.status === 'done';
                  return (
                    <tr
                      key={task.id}
                      onClick={() => openDialog('task', task)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Name Column */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#9ca3af', fontSize: '11px', width: '12px' }}>{idx + 1}</span>
                          <button
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTaskStatus(task.id);
                            }}
                          >
                            {isDone ? (
                              <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                            ) : (
                              <Circle size={15} style={{ color: '#9ca3af' }} />
                            )}
                          </button>
                          <span
                            style={{
                              fontWeight: 500,
                              color: isDone ? '#9ca3af' : '#111827',
                              textDecoration: isDone ? 'line-through' : 'none',
                            }}
                          >
                            {task.title}
                          </span>
                        </div>
                      </td>

                      {/* ETA Column with purple auto-scheduled icon */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ color: '#4b5563', fontSize: '12px' }}>
                            {task.scheduledStart
                              ? new Date(task.scheduledStart).toLocaleDateString([], {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'Mon Jun 30'}
                          </span>
                          <span
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: '#8b5cf6',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '8px',
                              color: '#fff',
                            }}
                            title="Auto-scheduled by Motion"
                          >
                            ✦
                          </span>
                        </div>
                      </td>

                      {/* Assignee Column */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span
                            style={{
                              width: '15px',
                              height: '15px',
                              borderRadius: '50%',
                              background: '#10b981',
                              color: '#fff',
                              fontSize: '9px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                            }}
                          >
                            M
                          </span>
                          <span style={{ color: '#374151' }}>{task.assignee || 'Motion'}</span>
                        </div>
                      </td>

                      {/* Project Column */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4b5563' }}>
                          <Box size={13} style={{ color: '#9ca3af' }} />
                          <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {currentProject?.name || 'YouTube Video ...'}
                          </span>
                        </div>
                      </td>

                      {/* Completed At */}
                      <td style={{ color: '#9ca3af' }}>
                        {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '—'}
                      </td>

                      {/* Duration */}
                      <td style={{ color: '#374151' }}>{task.durationMinutes}m</td>

                      {/* Deadline */}
                      <td style={{ color: '#4b5563' }}>
                        {task.deadline || 'Fri Oct 3'}
                      </td>

                      {/* Compl... */}
                      <td style={{ color: '#9ca3af' }}>0m</td>

                      {/* Status */}
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            color: isDone ? '#10b981' : '#4b5563',
                            fontWeight: 500,
                          }}
                        >
                          {isDone ? 'Done' : 'Todo'}
                        </span>
                      </td>
                    </tr>
                  );
                })}

              {/* Inline Task Creator Row matching Screenshot 6 Row 3 */}
              <tr>
                <td colSpan={9} style={{ padding: '6px 12px', background: '#fafafa' }}>
                  <form
                    onSubmit={handleQuickSubmit}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                  >
                    <Circle size={15} style={{ color: '#9ca3af' }} />
                    <input
                      type="text"
                      placeholder="Add a new task..."
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '12px',
                        flex: 1,
                        color: '#111827',
                      }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: '#8b5cf6',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          color: '#fff',
                        }}
                        title="Auto-scheduled"
                      >
                        ✦
                      </span>

                      {quickTitle && (
                        <>
                          <button
                            type="button"
                            className="formatting-btn"
                            onClick={() => setQuickTitle('')}
                          >
                            <X size={13} />
                          </button>
                          <button
                            type="submit"
                            style={{
                              background: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <CornerDownLeft size={12} />
                          </button>
                        </>
                      )}

                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#4b5563', marginLeft: '12px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> Motion
                      </span>
                      <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '12px' }}>30m</span>
                      <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '12px' }}>Auto-deadline</span>
                    </div>
                  </form>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
