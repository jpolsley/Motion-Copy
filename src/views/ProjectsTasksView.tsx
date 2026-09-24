import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Box,
  MoreHorizontal,
  Info,
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
  Puzzle,
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
  CheckSquare,
  ExternalLink,
  Flag,
  ArrowRight,
  Layers,
  Check,
} from 'lucide-react';
import { TaskItem, ProjectItem, TaskPriority, ProjectStatus } from '../types';

export default function ProjectsTasksView() {
  const {
    state,
    selectedProjectId,
    setSelectedProjectId,
    openDialog,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    updateProject,
    createProject,
    addToast,
  } = useApp();

  // Tab views: 'overview' is the authentic 2-column Motion Project page matching screenshot!
  const [activeTab, setActiveTab] = useState<'overview' | 'tasklist' | 'board' | 'navigate'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [groupExpanded, setGroupExpanded] = useState(true);
  const [showResolved, setShowResolved] = useState(true);
  const [onlyPastDeadline, setOnlyPastDeadline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'stage' | 'project' | 'status'>('stage');

  // Project selector dropdown state
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);

  // Active stage filter (from clicking milestone timeline dot)
  const [filterStageId, setFilterStageId] = useState<string | null>(null);

  // Quick task creation for specific stages
  const [quickStageInput, setQuickStageInput] = useState<{ [stageId: string]: string }>({});

  // Inline task creation for table
  const [quickTitle, setQuickTitle] = useState('');

  // Selected project (defaults to proj-yt or first project)
  const currentProject: ProjectItem =
    state.projects.find((p) => p.id === selectedProjectId) || state.projects[0] || {
      id: 'proj-yt',
      name: 'YouTube Video Launch',
      description: '',
      color: '#4b5563',
      createdAt: Date.now(),
    };

  // Editable Project Document state
  const [docContent, setDocContent] = useState(currentProject.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentProject.name);

  // Sync state if project changes
  React.useEffect(() => {
    setDocContent(currentProject.description || '');
    setEditedTitle(currentProject.name);
  }, [currentProject.id, currentProject.description, currentProject.name]);

  const handleDocChange = (newVal: string) => {
    setDocContent(newVal);
    updateProject(currentProject.id, { description: newVal });
  };

  const handleTitleSubmit = () => {
    if (editedTitle.trim()) {
      updateProject(currentProject.id, { name: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  // Tasks for current project
  const projectTasks = useMemo(() => {
    return state.tasks.filter((t) => {
      if (selectedProjectId && t.projectId !== selectedProjectId) return false;
      if (!showResolved && t.status === 'done') return false;
      if (onlyPastDeadline && t.deadline) {
        const today = new Date().toISOString().split('T')[0];
        if (t.deadline >= today) return false;
      }
      if (filterStageId && t.stageId !== filterStageId) return false;
      if (searchQuery.trim()) {
        return (
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });
  }, [state.tasks, selectedProjectId, showResolved, onlyPastDeadline, filterStageId, searchQuery]);

  // Milestones/Stages for the current project
  const stages = useMemo(() => {
    if (currentProject.milestones && currentProject.milestones.length > 0) {
      return currentProject.milestones;
    }
    return [
      { id: 'm-1', title: 'Stage 1: Pre-production & Script', targetDate: '2026-09-15', completed: true, color: '#10b981' },
      { id: 'm-2', title: 'Stage 2: Recording & Rough Cut', targetDate: '2026-09-22', completed: false, color: '#3b82f6' },
      { id: 'm-3', title: 'Stage 3: Editing & Polish', targetDate: '2026-10-01', completed: false, color: '#8b5cf6' },
      { id: 'm-4', title: 'Stage 4: Launch & Distribution', targetDate: '2026-10-15', completed: false, color: '#f59e0b' },
    ];
  }, [currentProject]);

  // Overall completion stats
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Add task to a specific stage
  const handleAddStageTask = (stageId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = quickStageInput[stageId]?.trim();
    if (!title) return;

    createTask({
      title,
      projectId: currentProject.id,
      stageId,
      milestoneId: stageId,
      assignee: currentProject.assignee || 'ES',
      workspace: currentProject.workspace || 'My Private Workspace',
      folder: currentProject.folder || 'Video editing',
      durationMinutes: 30,
      priority: 'medium',
      deadline: stages.find((s) => s.id === stageId)?.targetDate || '2026-10-15',
    });

    setQuickStageInput((prev) => ({ ...prev, [stageId]: '' }));
    addToast(`Task added to stage`);
  };

  // Add task from table inline row
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    createTask({
      title: quickTitle.trim(),
      projectId: currentProject.id,
      durationMinutes: 30,
      priority: 'medium',
      assignee: currentProject.assignee || 'ES',
      deadline: currentProject.targetDate || '2026-10-15',
    });
    setQuickTitle('');
    addToast('Task added');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* =========================================================================
          1. TOP HEADER (Workspace Breadcrumb, Project Switcher, Status, Actions)
          ========================================================================= */}
      <div className="view-top-header">
        <div className="project-title-area" style={{ position: 'relative' }}>
          <Box size={16} style={{ color: '#4b5563' }} />

          {/* Project Name Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 6px',
                borderRadius: '6px',
              }}
              className="hover:bg-gray-100"
            >
              <span className="project-title-text" style={{ fontSize: '15px' }}>
                {currentProject.name}
              </span>
              <ChevronDown size={14} style={{ color: '#6b7280' }} />
            </button>

            {projectMenuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 80 }}
                  onClick={() => setProjectMenuOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    width: '240px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    zIndex: 90,
                    padding: '6px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', padding: '4px 8px' }}>
                    PROJECTS
                  </div>
                  {state.projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        setProjectMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 8px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: '6px',
                        background: proj.id === currentProject.id ? '#f3f4f6' : 'transparent',
                        fontWeight: proj.id === currentProject.id ? 600 : 400,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Box size={14} style={{ color: proj.color || '#4b5563' }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                          {proj.name}
                        </span>
                      </div>
                      {proj.id === currentProject.id && <Check size={14} style={{ color: '#2563eb' }} />}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={() => {
                        setProjectMenuOpen(false);
                        openDialog('project');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '6px 8px',
                        fontSize: '12px',
                        color: '#2563eb',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={13} />
                      <span>Create New Project</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Project Status Badge with dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="badge-open"
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: currentProject.status === 'completed' ? '#ecfdf5' : '#f3f4f6',
                color: currentProject.status === 'completed' ? '#059669' : '#374151',
                borderColor: currentProject.status === 'completed' ? '#a7f3d0' : '#e5e7eb',
              }}
            >
              <span>{currentProject.status ? currentProject.status.toUpperCase() : 'OPEN'}</span>
              <ChevronDown size={10} />
            </button>

            {statusMenuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 80 }}
                  onClick={() => setStatusMenuOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    width: '130px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    zIndex: 90,
                    padding: '4px',
                  }}
                >
                  {(['open', 'in_progress', 'completed', 'on_hold'] as ProjectStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        updateProject(currentProject.id, { status: st });
                        setStatusMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '5px 8px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        border: 'none',
                        background: currentProject.status === st ? '#eff6ff' : 'transparent',
                        color: currentProject.status === st ? '#2563eb' : '#374151',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                      }}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Breadcrumb info */}
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            {currentProject.workspace || 'My Private Workspace'} / {currentProject.folder || 'Video editing'}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="toolbar-btn"
            onClick={() => openDialog('project', currentProject)}
            title="Edit project details and settings"
          >
            <Info size={13} style={{ color: '#6b7280' }} />
            <span>Project info</span>
          </button>

          <button
            className="toolbar-btn"
            style={{ borderColor: '#d1d5db', background: '#faf5ff', color: '#7c3aed' }}
            onClick={() => openDialog('project-ai-template')}
            title="Generate milestone schedule with AI"
          >
            <Sparkles size={13} style={{ color: '#8b5cf6' }} />
            <span style={{ fontWeight: 600 }}>AI Project Plan</span>
          </button>

          <button
            className="btn-motion-new"
            style={{ width: 'auto', height: '30px', margin: 0, padding: '0 12px', fontSize: '12px' }}
            onClick={() => openDialog('task', { projectId: currentProject.id })}
          >
            <Plus size={14} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. SUBNAV TABS (Project Overview | Task List | Board | Navigate + Search)
          ========================================================================= */}
      <div
        style={{
          height: '38px',
          borderBottom: '1px solid var(--panel-border)',
          padding: '0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          flexShrink: 0,
        }}
      >
        <div className="header-nav-tabs">
          <button
            className={`header-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
            title="Motion 2-Column Project Document and Task Pipeline"
          >
            <Layers size={13} />
            <span>Project Overview</span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#2563eb',
                display: 'inline-block',
              }}
            />
          </button>

          <button
            className={`header-tab ${activeTab === 'tasklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasklist')}
          >
            <span>Task List</span>
            <span className="motion-nav-badge" style={{ fontSize: '10px' }}>
              {projectTasks.length}
            </span>
          </button>

          <button
            className={`header-tab ${activeTab === 'board' ? 'active' : ''}`}
            onClick={() => setActiveTab('board')}
          >
            <span>Board</span>
          </button>

          <button
            className={`header-tab ${activeTab === 'navigate' ? 'active' : ''}`}
            onClick={() => setActiveTab('navigate')}
          >
            <Folder size={13} />
            <span>Navigate</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {filterStageId && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#eff6ff',
                color: '#2563eb',
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 500,
              }}
            >
              <span>Filtered by Stage</span>
              <button
                onClick={() => setFilterStageId(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
            <Search size={13} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: '12px', width: '130px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN VIEW ROUTING
          ========================================================================= */}
      {activeTab === 'overview' && (
        /* ACCURATE MOTION PROJECT VIEW (MATCHING IMAGE.PNG 2-COLUMN WORKSPACE) */
        <div className="project-split-layout">
          {/* ----------------- LEFT COLUMN: PROJECT DOCUMENT & METADATA ----------------- */}
          <div className="project-doc-pane">
            {/* Top Toolbar line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                <Puzzle size={14} style={{ color: '#8b5cf6' }} />
                <span>Template: Video Review Process</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className="toolbar-btn"
                  style={{ fontSize: '11px', padding: '2px 6px' }}
                  onClick={() => addToast('Template saved')}
                >
                  Save as template
                </button>
              </div>
            </div>

            {/* Editable Project Title */}
            <div style={{ marginBottom: '14px' }}>
              {isEditingTitle ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                    autoFocus
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: '#111827',
                      border: '1px solid #2563eb',
                      borderRadius: '6px',
                      padding: '2px 6px',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                </div>
              ) : (
                <h1
                  onClick={() => setIsEditingTitle(true)}
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#111827',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  title="Click to rename project"
                >
                  <span>{currentProject.name}</span>
                  <Edit2 size={14} style={{ color: '#9ca3af', opacity: 0.6 }} />
                </h1>
              )}
            </div>

            {/* Project Properties Strip (Assignee, Status, Start date, Deadline, Priority) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px',
                padding: '10px 12px',
                background: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                marginBottom: '16px',
                fontSize: '12px',
              }}
            >
              {/* Assignee */}
              <div>
                <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Assignee</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', fontWeight: 500 }}>
                  <span className="assignee-avatar-sm">{currentProject.assignee || 'ES'}</span>
                  <span>{currentProject.assignee === 'ES' ? 'Ethan' : currentProject.assignee || 'Motion'}</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Status</div>
                <div style={{ marginTop: '3px', fontWeight: 500, color: '#059669' }}>
                  ● {currentProject.status ? currentProject.status.toUpperCase() : 'OPEN'}
                </div>
              </div>

              {/* Start Date */}
              <div>
                <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Start Date</div>
                <input
                  type="date"
                  value={currentProject.startDate || '2026-09-15'}
                  onChange={(e) => updateProject(currentProject.id, { startDate: e.target.value })}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#374151',
                    marginTop: '2px',
                    padding: 0,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Target Deadline */}
              <div>
                <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Target Deadline</div>
                <input
                  type="date"
                  value={currentProject.targetDate || '2026-10-15'}
                  onChange={(e) => updateProject(currentProject.id, { targetDate: e.target.value })}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#374151',
                    marginTop: '2px',
                    padding: 0,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Priority */}
              <div>
                <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Priority</div>
                <div style={{ marginTop: '3px', fontWeight: 500, color: '#dc2626' }}>
                  🚩 {currentProject.priority ? currentProject.priority.toUpperCase() : 'HIGH'}
                </div>
              </div>
            </div>

            {/* Rich Text Toolbar */}
            <div className="formatting-toolbar">
              <button type="button" className="formatting-btn" title="Bold"><Bold size={13} /></button>
              <button type="button" className="formatting-btn" title="Italic"><Italic size={13} /></button>
              <button type="button" className="formatting-btn" title="Underline"><Underline size={13} /></button>
              <button type="button" className="formatting-btn" title="Strikethrough"><Strikethrough size={13} /></button>
              <div style={{ width: '1px', height: '14px', background: '#e5e7eb', margin: '0 2px' }} />
              <button type="button" className="formatting-btn" title="Heading 1"><Heading1 size={13} /></button>
              <button type="button" className="formatting-btn" title="Heading 2"><Heading2 size={13} /></button>
              <div style={{ width: '1px', height: '14px', background: '#e5e7eb', margin: '0 2px' }} />
              <button type="button" className="formatting-btn" title="Bullet List"><List size={13} /></button>
              <button type="button" className="formatting-btn" title="Numbered List"><ListOrdered size={13} /></button>
              <button type="button" className="formatting-btn" title="Checklist"><CheckSquare size={13} /></button>
              <button type="button" className="formatting-btn" title="Quote"><Quote size={13} /></button>
              <button type="button" className="formatting-btn" title="Code"><Code size={13} /></button>
              <button type="button" className="formatting-btn" title="Link"><Link2 size={13} /></button>
            </div>

            {/* Document / Notes Content Area (Live Editable) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <textarea
                value={docContent}
                onChange={(e) => handleDocChange(e.target.value)}
                placeholder="Write project description, specifications, or deliverables checklist..."
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: '380px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#1f2937',
                  fontFamily: 'inherit',
                  padding: 0,
                  background: 'transparent',
                }}
              />
            </div>
          </div>

          {/* ----------------- RIGHT COLUMN: TASK PIPELINE & MILESTONES (MATCHING IMAGE.PNG) ----------------- */}
          <div className="project-pipeline-pane">
            {/* Header: "Tasks ↗" and count */}
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--panel-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Tasks</span>
                <button
                  onClick={() => setActiveTab('tasklist')}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  title="Open full table view"
                >
                  <ExternalLink size={13} style={{ color: '#6b7280' }} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>
                  {completedTasks} of {totalTasks} done ({progressPercent}%)
                </span>
                <button
                  className="toolbar-btn"
                  style={{ padding: '2px 6px', fontSize: '11px' }}
                  onClick={() => openDialog('task', { projectId: currentProject.id })}
                >
                  <Plus size={12} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Milestone Timeline Mini-bar with "TODAY 🔻" Marker (from screenshot) */}
            <div className="timeline-minibar-container">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#6b7280', fontWeight: 600 }}>
                <span>MILESTONE TIMELINE</span>
                <span>Sep 15 — Oct 15</span>
              </div>

              <div className="timeline-track-wrapper">
                {/* Background line */}
                <div className="timeline-track-line" />

                {/* Completed progress line */}
                <div
                  className="timeline-track-progress"
                  style={{ width: `${Math.min(100, Math.max(15, progressPercent))}%` }}
                />

                {/* "TODAY 🔻" Marker positioned at current date */}
                <div className="timeline-today-indicator" style={{ left: '42%' }}>
                  <div className="timeline-today-badge">
                    <span>TODAY</span>
                    <span>🔻</span>
                  </div>
                </div>

                {/* Milestone Node Dots */}
                {stages.map((st, idx) => {
                  const leftPercent = 10 + (idx / Math.max(1, stages.length - 1)) * 80;
                  const isFiltered = filterStageId === st.id;
                  return (
                    <div
                      key={st.id}
                      className="timeline-node-item"
                      style={{ left: `${leftPercent}%` }}
                      onClick={() => setFilterStageId(isFiltered ? null : st.id)}
                      title={`Milestone: ${st.title} (${st.targetDate || 'Pending'}). Click to filter.`}
                    >
                      <div
                        className={`timeline-node-dot ${st.completed ? 'completed' : idx === 1 ? 'current' : ''}`}
                        style={{
                          borderColor: isFiltered ? '#2563eb' : '#ffffff',
                          boxShadow: isFiltered ? '0 0 0 2px #2563eb' : undefined,
                        }}
                      />
                      <div className="timeline-node-label">
                        {st.targetDate ? st.targetDate.slice(5).replace('-', '/') : `M${idx + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stages & Associated Task Groups */}
            <div style={{ flex: 1, paddingBottom: '24px' }}>
              {stages.map((stage, stageIdx) => {
                const stageTasks = projectTasks.filter((t) => t.stageId === stage.id || (!t.stageId && stageIdx === 0));
                const stageDoneCount = stageTasks.filter((t) => t.status === 'done').length;

                return (
                  <div key={stage.id} className="pipeline-stage-group">
                    {/* Stage Header */}
                    <div className="pipeline-stage-header">
                      <div className="pipeline-stage-title">
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: stage.color || (stage.completed ? '#10b981' : '#3b82f6'),
                          }}
                        />
                        <span>{stage.title}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="pipeline-stage-badge">
                          {stageDoneCount}/{stageTasks.length}
                        </span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {stage.targetDate || 'No date'}
                        </span>
                      </div>
                    </div>

                    {/* Stage Tasks List */}
                    <div>
                      {stageTasks.length === 0 ? (
                        <div style={{ padding: '12px', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                          No tasks in this stage yet
                        </div>
                      ) : (
                        stageTasks.map((task) => {
                          const isDone = task.status === 'done';
                          return (
                            <div
                              key={task.id}
                              className="stage-task-row"
                              onClick={() => openDialog('task', task)}
                            >
                              {/* Checkbox button */}
                              <button
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskStatus(task.id);
                                }}
                              >
                                {isDone ? (
                                  <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                                ) : (
                                  <Circle size={16} style={{ color: '#9ca3af' }} />
                                )}
                              </button>

                              {/* Task Title */}
                              <span className={`stage-task-title ${isDone ? 'done' : ''}`}>
                                {task.title}
                              </span>

                              {/* Duration Pill */}
                              <span className="duration-pill">{task.durationMinutes}m</span>

                              {/* Status / Auto-schedule Sparkle Badge */}
                              <span
                                className={`status-pill ${task.status}`}
                                title={task.status}
                              >
                                {task.status === 'done' ? 'Done' : '✦ Scheduled'}
                              </span>

                              {/* ETA / Date */}
                              <span style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                {task.deadline ? task.deadline.slice(5) : 'Auto'}
                              </span>

                              {/* Assignee Avatar */}
                              <span className="assignee-avatar-sm" title={`Assignee: ${task.assignee || 'ES'}`}>
                                {task.assignee ? task.assignee.slice(0, 2).toUpperCase() : 'ES'}
                              </span>
                            </div>
                          );
                        })
                      )}

                      {/* Inline quick add task to this stage */}
                      <form
                        onSubmit={(e) => handleAddStageTask(stage.id, e)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          background: '#fafafa',
                          borderTop: '1px solid #f3f4f6',
                          gap: '6px',
                        }}
                      >
                        <Plus size={12} style={{ color: '#9ca3af' }} />
                        <input
                          type="text"
                          placeholder={`Add task to ${stage.title.split(':')[0]}...`}
                          value={quickStageInput[stage.id] || ''}
                          onChange={(e) =>
                            setQuickStageInput((prev) => ({ ...prev, [stage.id]: e.target.value }))
                          }
                          style={{
                            border: 'none',
                            background: 'transparent',
                            outline: 'none',
                            fontSize: '11px',
                            flex: 1,
                            color: '#111827',
                          }}
                        />
                        {quickStageInput[stage.id] && (
                          <button
                            type="submit"
                            style={{
                              background: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              cursor: 'pointer',
                            }}
                          >
                            <CornerDownLeft size={10} />
                          </button>
                        )}
                      </form>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasklist' && (
        /* FULL MOTION TASK LIST TABLE */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Table Toolbar */}
          <div className="table-toolbar">
            <div className="toolbar-left">
              <div
                className="toolbar-btn"
                onClick={() => setGroupBy(groupBy === 'stage' ? 'project' : groupBy === 'project' ? 'status' : 'stage')}
              >
                <Box size={13} style={{ color: '#3b82f6' }} />
                <span>Group by: {groupBy === 'stage' ? 'Stage' : groupBy === 'project' ? 'Project' : 'Status'}</span>
                <ChevronDown size={11} />
              </div>

              <div className="view-mode-toggle">
                <button
                  className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  List
                </button>
                <button
                  className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                  onClick={() => setActiveTab('board')}
                >
                  Kanban
                </button>
              </div>

              <button className="toolbar-btn" onClick={() => addToast('Sorted by priority')}>
                <span>Sort Tasks</span>
              </button>
            </div>

            <div style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.04em' }}>
              TASKS: {projectTasks.length}
            </div>
          </div>

          {/* Sub-bar Checkboxes */}
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

          {/* Table Content */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table className="motion-table">
              <thead>
                <tr>
                  <th style={{ width: '300px' }}>NAME</th>
                  <th style={{ width: '130px' }}>ETA</th>
                  <th style={{ width: '110px' }}>ASSIGNEE</th>
                  <th style={{ width: '140px' }}>PROJECT</th>
                  <th style={{ width: '110px' }}>COMPLETED AT</th>
                  <th style={{ width: '80px' }}>DURATION</th>
                  <th style={{ width: '110px' }}>DEADLINE</th>
                  <th style={{ width: '70px' }}>PRIORITY</th>
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
                        {currentProject?.name} ({projectTasks.length} tasks)
                      </span>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: currentProject?.color || '#8b5cf6',
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 500, color: '#4b5563', fontSize: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="assignee-avatar-sm">{currentProject.assignee || 'ES'}</span> {currentProject.assignee === 'ES' ? 'Ethan' : 'Motion'}
                        </span>
                        <span>{progressPercent}% Complete</span>
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
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#9ca3af', fontSize: '11px', width: '14px' }}>{idx + 1}</span>
                            <button
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskStatus(task.id);
                              }}
                            >
                              {isDone ? (
                                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                              ) : (
                                <Circle size={16} style={{ color: '#9ca3af' }} />
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

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ color: '#4b5563', fontSize: '12px' }}>
                              {task.scheduledStart
                                ? new Date(task.scheduledStart).toLocaleDateString([], {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'Scheduled'}
                            </span>
                            <span
                              style={{
                                width: '13px',
                                height: '13px',
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

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span className="assignee-avatar-sm">{task.assignee ? task.assignee.slice(0, 2).toUpperCase() : 'ES'}</span>
                            <span style={{ color: '#374151' }}>{task.assignee || 'ES'}</span>
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#4b5563' }}>
                            <Box size={13} style={{ color: '#9ca3af' }} />
                            <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {currentProject?.name}
                            </span>
                          </div>
                        </td>

                        <td style={{ color: '#9ca3af' }}>
                          {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '—'}
                        </td>

                        <td style={{ color: '#374151' }}>{task.durationMinutes}m</td>

                        <td style={{ color: '#4b5563' }}>
                          {task.deadline || 'Oct 15'}
                        </td>

                        <td>
                          <span style={{ fontSize: '11px', color: task.priority === 'urgent' ? '#dc2626' : '#4b5563', fontWeight: 600 }}>
                            {task.priority ? task.priority.toUpperCase() : 'NORMAL'}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status-pill ${task.status}`}
                          >
                            {task.status === 'done' ? 'Done' : 'Todo'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                {/* Inline Task Creator Row */}
                <tr>
                  <td colSpan={9} style={{ padding: '8px 14px', background: '#fafafa' }}>
                    <form
                      onSubmit={handleQuickSubmit}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      <Circle size={15} style={{ color: '#9ca3af' }} />
                      <input
                        type="text"
                        placeholder="Add a new task to this project..."
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

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          <button
                            type="submit"
                            style={{
                              background: '#2563eb',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '2px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              fontSize: '11px',
                            }}
                          >
                            <CornerDownLeft size={12} />
                          </button>
                        )}
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>30m</span>
                        <span style={{ fontSize: '11px', color: '#6b7280' }}>Auto-deadline</span>
                      </div>
                    </form>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'board' && (
        /* KANBAN BOARD VIEW */
        <div className="kanban-board-layout">
          {(['todo', 'in_progress', 'done'] as const).map((columnStatus) => {
            const colTasks = projectTasks.filter((t) => {
              if (columnStatus === 'todo') return t.status === 'todo' || !t.status;
              if (columnStatus === 'in_progress') return t.status === 'in_progress';
              return t.status === 'done';
            });

            return (
              <div key={columnStatus} className="kanban-col">
                <div className="kanban-col-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ textTransform: 'capitalize' }}>
                      {columnStatus === 'in_progress' ? 'In Progress' : columnStatus}
                    </span>
                    <span className="pipeline-stage-badge">{colTasks.length}</span>
                  </div>
                  <button
                    className="toolbar-btn"
                    style={{ padding: '2px 4px' }}
                    onClick={() => openDialog('task', { projectId: currentProject.id, status: columnStatus })}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <div className="kanban-col-cards">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="kanban-card"
                      onClick={() => openDialog('task', task)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: 600 }}>
                          {task.stageId ? stages.find((s) => s.id === task.stageId)?.title.split(':')[0] : 'General'}
                        </span>
                        <span className="duration-pill">{task.durationMinutes}m</span>
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                        {task.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="assignee-avatar-sm">{task.assignee ? task.assignee.slice(0, 2).toUpperCase() : 'ES'}</span>
                          <span>{task.deadline || 'No date'}</span>
                        </div>
                        <span style={{ color: task.priority === 'urgent' ? '#dc2626' : '#6b7280', fontWeight: 600 }}>
                          🚩 {task.priority || 'medium'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'navigate' && (
        /* NAVIGATE WORKSPACE HIERARCHY */
        <div style={{ padding: '28px', maxWidth: '720px', overflowY: 'auto' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            Workspaces & Projects Explorer
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {state.projects.map((proj) => {
              const count = state.tasks.filter((t) => t.projectId === proj.id).length;
              const isCurrent = proj.id === currentProject.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setActiveTab('overview');
                  }}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isCurrent ? '#eff6ff' : '#ffffff',
                    borderColor: isCurrent ? '#93c5fd' : '#e5e7eb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Box size={20} style={{ color: proj.color || '#4b5563' }} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                        {proj.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                        {proj.workspace || 'My Private Workspace'} • {count} tasks
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge-open">{proj.status ? proj.status.toUpperCase() : 'OPEN'}</span>
                    <ArrowRight size={14} style={{ color: '#9ca3af' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
