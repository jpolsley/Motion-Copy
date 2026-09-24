import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  Plus,
  Search,
  SlidersHorizontal,
  ClipboardList,
  Calendar,
  Box,
  BarChart2,
  Sparkles,
  BookOpen,
  Folder,
  FileText,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Clock,
} from 'lucide-react';
import { ViewType } from '../types';

export default function Sidebar() {
  const {
    state,
    currentView,
    setCurrentView,
    selectedProjectId,
    setSelectedProjectId,
    openDialog,
    addToast,
  } = useApp();

  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [workspacesExpanded, setWorkspacesExpanded] = useState(true);
  const [ytProjectExpanded, setYtProjectExpanded] = useState(true);

  // Active focus task (defaults to first active task or "Draft script")
  const focusTask = state.tasks.find((t) => t.status !== 'done') || state.tasks[0];

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    addToast(isPlaying ? 'Focus timer paused' : 'Focus session started: Draft script');
  };

  const todayDateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <aside className="motion-sidebar">
      {/* 1. Top Focus Task Card */}
      <div
        className="sidebar-focus-card"
        onClick={() => setCurrentView('projects-tasks')}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <div className="sidebar-focus-title">
            {focusTask?.title || 'Draft script'}
          </div>
          <div className="sidebar-focus-time">
            {focusTask?.durationMinutes ? `9:30 - 10:30 AM` : 'Schedule ready'}
          </div>
        </div>

        <button
          className="sidebar-play-btn"
          onClick={handlePlayToggle}
          title={isPlaying ? 'Pause focus session' : 'Start working on this task'}
        >
          {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" style={{ marginLeft: '1px' }} />}
        </button>
      </div>

      {/* 2. Big Blue + New Button */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn-motion-new"
          onClick={() => setNewMenuOpen(!newMenuOpen)}
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New</span>
        </button>

        {/* Popover Dropdown matching Screenshot 1 */}
        {newMenuOpen && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 90 }}
              onClick={() => setNewMenuOpen(false)}
            />
            <div className="new-popover-menu">
              <button
                className="new-popover-item"
                onClick={() => {
                  setNewMenuOpen(false);
                  openDialog('task');
                }}
              >
                <CheckSquare size={14} style={{ color: '#4b5563' }} />
                <span>New Task</span>
                <span className="shortcut-tag">⌥ Space</span>
              </button>

              <button
                className="new-popover-item"
                onClick={() => {
                  setNewMenuOpen(false);
                  openDialog('note');
                }}
              >
                <FileText size={14} style={{ color: '#4b5563' }} />
                <span>New Doc</span>
              </button>

              <button
                className="new-popover-item"
                onClick={() => {
                  setNewMenuOpen(false);
                  openDialog('project');
                }}
              >
                <Box size={14} style={{ color: '#4b5563' }} />
                <span>New Project</span>
              </button>

              <button
                className="new-popover-item"
                onClick={() => {
                  setNewMenuOpen(false);
                  openDialog('meeting');
                }}
              >
                <Calendar size={14} style={{ color: '#4b5563' }} />
                <span>New Meeting or Event</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 3. Search Bar with ⌘ K and filter */}
      <div className="sidebar-search-box">
        <Search size={13} style={{ color: '#9ca3af' }} />
        <input
          type="text"
          className="sidebar-search-input"
          placeholder="Search"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addToast(`Searching for "${(e.target as HTMLInputElement).value}"`);
            }
          }}
        />
        <span className="search-badge">⌘ K</span>
        <SlidersHorizontal size={13} style={{ color: '#9ca3af', cursor: 'pointer' }} />
      </div>

      {/* 4. Navigation Menu List */}
      <div className="motion-nav-list">
        <button
          className={`motion-nav-item ${currentView === 'agenda' ? 'active' : ''}`}
          onClick={() => setCurrentView('agenda')}
        >
          <ClipboardList size={15} style={{ color: '#3b82f6' }} />
          <span>AI Agenda</span>
        </button>

        <button
          className={`motion-nav-item ${currentView === 'calendar' ? 'active' : ''}`}
          onClick={() => setCurrentView('calendar')}
        >
          <Calendar size={15} style={{ color: '#2563eb' }} />
          <span>Calendar</span>
          <span className="motion-nav-badge">{todayDateLabel}</span>
        </button>

        <button
          className={`motion-nav-item ${currentView === 'projects-tasks' ? 'active' : ''}`}
          onClick={() => setCurrentView('projects-tasks')}
        >
          <Box size={15} style={{ color: '#4b5563' }} />
          <span>Projects & Tasks</span>
        </button>

        <button
          className={`motion-nav-item ${currentView === 'team-schedule' ? 'active' : ''}`}
          onClick={() => setCurrentView('team-schedule')}
        >
          <BarChart2 size={15} style={{ color: '#6b7280' }} />
          <span>Team Schedule</span>
        </button>

        <button
          className={`motion-nav-item ${currentView === 'ai-meeting-notes' ? 'active' : ''}`}
          onClick={() => setCurrentView('ai-meeting-notes')}
        >
          <Sparkles size={15} style={{ color: '#8b5cf6' }} />
          <span>AI Meeting Notes</span>
        </button>

        <button
          className={`motion-nav-item ${currentView === 'tutorials' ? 'active' : ''}`}
          onClick={() => setCurrentView('tutorials')}
        >
          <BookOpen size={15} style={{ color: '#a855f7' }} />
          <span style={{ color: '#7e22ce', fontWeight: 600 }}>Tutorials</span>
          <span className="motion-nav-badge" style={{ color: '#9333ea', fontWeight: 600 }}>16%</span>
        </button>

        <div style={{ padding: '8px 8px 4px', fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '16px', textAlign: 'center' }}>0</span>
          <span>Past dues</span>
        </div>

        {/* Favorites section */}
        <div className="motion-section-header">
          <span>Favorites</span>
          <ChevronDown size={12} />
        </div>
        <button
          className="motion-nav-item"
          onClick={() => setCurrentView('projects-tasks')}
        >
          <CheckSquare size={14} style={{ color: '#6b7280' }} />
          <span>My Tasks</span>
        </button>

        {/* Workspaces Section */}
        <div className="motion-section-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Workspaces</span>
            <ChevronDown
              size={12}
              style={{ cursor: 'pointer' }}
              onClick={() => setWorkspacesExpanded(!workspacesExpanded)}
            />
          </span>
          <Plus
            size={13}
            style={{ cursor: 'pointer' }}
            onClick={() => openDialog('project')}
          />
        </div>

        {workspacesExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {/* My Private Workspace */}
            <div
              className="motion-nav-item"
              style={{ fontWeight: 500 }}
              onClick={() => setCurrentView('projects-tasks')}
            >
              <Box size={14} style={{ color: '#9ca3af' }} />
              <span>My Private Workspace</span>
              <span className="motion-nav-badge">18</span>
            </div>

            {/* YouTube Video Launch (Active/Expanded) */}
            <div style={{ paddingLeft: '8px' }}>
              <div
                className={`motion-nav-item ${selectedProjectId === 'proj-yt' && currentView === 'projects-tasks' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedProjectId('proj-yt');
                  setCurrentView('projects-tasks');
                  setYtProjectExpanded(!ytProjectExpanded);
                }}
              >
                <Box size={14} style={{ color: '#4b5563' }} />
                <span>YouTube Video Launch</span>
              </div>

              {ytProjectExpanded && (
                <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <button
                    className="motion-nav-item"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                    onClick={() => {
                      setSelectedProjectId('proj-yt');
                      setCurrentView('projects-tasks');
                    }}
                  >
                    <Folder size={13} style={{ color: '#9ca3af' }} />
                    <span>Video editing</span>
                  </button>

                  <button
                    className="motion-nav-item"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                    onClick={() => {
                      setSelectedProjectId('proj-video');
                      setCurrentView('projects-tasks');
                    }}
                  >
                    <Box size={13} style={{ color: '#9ca3af' }} />
                    <span>Motion Tutorial Video</span>
                  </button>

                  <button
                    className="motion-nav-item"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                    onClick={() => {
                      setSelectedProjectId('proj-yt');
                      setCurrentView('projects-tasks');
                    }}
                  >
                    <Box size={13} style={{ color: '#9ca3af' }} />
                    <span>Motion AI review</span>
                  </button>

                  <button
                    className="motion-nav-item"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                    onClick={() => setCurrentView('agenda')}
                  >
                    <Folder size={13} style={{ color: '#9ca3af' }} />
                    <span>Agenda</span>
                    <span className="motion-nav-badge">14</span>
                  </button>
                </div>
              )}
            </div>

            {/* Launching a blogpost */}
            <button
              className="motion-nav-item"
              onClick={() => {
                setSelectedProjectId('proj-blog');
                setCurrentView('projects-tasks');
              }}
            >
              <Box size={14} style={{ color: '#9ca3af' }} />
              <span>Launching a blogpost</span>
              <span className="motion-nav-badge">1</span>
            </button>

            {/* My Workspace */}
            <button className="motion-nav-item">
              <Box size={14} style={{ color: '#9ca3af' }} />
              <span>My Workspace</span>
              <span className="motion-nav-badge">0</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
