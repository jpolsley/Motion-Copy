import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  AppState,
  TaskItem,
  CalendarEvent,
  ProjectItem,
  NoteItem,
  BookingConfig,
  ScheduleConflict,
  UserSettings,
  DialogType,
  ToastItem,
  ViewType,
} from '../types';
import { calculateSchedule } from '../utils/scheduler';

interface AppContextValue {
  state: AppState;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  activeFocusTaskId: string | null;
  setActiveFocusTaskId: (id: string | null) => void;

  dialogOpen: DialogType;
  dialogData: any;
  openDialog: (type: DialogType, data?: any) => void;
  closeDialog: () => void;
  toasts: ToastItem[];
  addToast: (text: string, isError?: boolean) => void;

  // Task actions
  createTask: (task: Partial<TaskItem>, autoSchedule?: boolean) => TaskItem;
  updateTask: (id: string, updates: Partial<TaskItem>, autoSchedule?: boolean) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  toggleTaskLock: (id: string) => void;

  // Calendar actions
  createEvent: (ev: Partial<CalendarEvent>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Project actions
  createProject: (proj: Partial<ProjectItem>) => ProjectItem;
  updateProject: (id: string, updates: Partial<ProjectItem>) => void;
  deleteProject: (id: string) => void;

  // Note actions
  createNote: (note: Partial<NoteItem>) => NoteItem;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;

  // Booking config
  updateBooking: (config: Partial<BookingConfig>) => void;
  bookMeetingFromLink: (name: string, email: string, dateIso: string, durationMinutes: number, notes?: string) => CalendarEvent;

  // Scheduling engine
  runAutoSchedule: () => void;
  resolveConflict: (conflictId: string, resolutionAction: 'extend' | 'shorten' | 'urgent') => void;

  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;

  // AI assistant helpers
  parseAndCreateTaskWithAI: (input: string) => Promise<TaskItem>;
  generateProjectPlanWithAI: (goal: string, deadline?: string) => Promise<any>;
  extractMeetingNotesWithAI: (noteContent: string, noteTitle?: string) => Promise<any>;
}

const STORAGE_KEY = 'motion-workspace-v5';

const DEFAULT_SETTINGS: UserSettings = {
  name: 'Motion',
  roleTitle: 'Product & Engineering',
  workingHours: { start: 9, end: 18 },
  workingDays: [1, 2, 3, 4, 5],
  autoSchedule: true,
  protectFocusTime: true,
  bufferMinutes: 10,
  defaultTaskDuration: 30,
};

const DEFAULT_BOOKING: BookingConfig = {
  slug: 'motion-sync',
  title: 'Motion 30-min Strategy Sync',
  description: 'Book an appointment within my availability. Flexible tasks automatically move to protect focus.',
  durations: [15, 30, 45, 60],
  bufferMinutes: 15,
  workingDays: [1, 2, 3, 4, 5],
  startHour: 9,
  endHour: 17,
  timezone: 'EEST',
};

function getInitialProjects(): ProjectItem[] {
  return [
    {
      id: 'proj-yt',
      name: 'YouTube Video Launch',
      description: `### YouTube Video Launch Workflow

**Objective**: Produce and distribute a high-impact walkthrough video detailing Motion's AI auto-scheduling, calendar blocking, and conflict resolution.

#### Core Deliverables:
- Finalized 4K Master Video with clean voiceover and annotated B-roll
- 3 High-contrast Figma thumbnail variants (A/B testing ready)
- SEO optimized title, tags, and description checklist
- Newsletter blast and Discord community announcement

#### Production Notes & Checklist:
- [x] Initial creative brief & hook approved by product team
- [x] Script outline drafted with all feature timestamps
- [ ] Screen captures of AI scheduling conflicts and auto-resolution
- [ ] Rough cut video editing and timeline pacing
- [ ] Final sound mix, background music ducking, and color grade
- [ ] Publish premiere and pin top discussion comment`,
      color: '#4b5563',
      workspace: 'My Private Workspace',
      folder: 'Video editing',
      status: 'open',
      priority: 'high',
      assignee: 'ES',
      startDate: '2026-09-15',
      targetDate: '2026-10-15',
      milestones: [
        { id: 'm-1', title: 'Stage 1: Pre-production & Script', targetDate: '2026-09-15', completed: true, color: '#10b981' },
        { id: 'm-2', title: 'Stage 2: Recording & Rough Cut', targetDate: '2026-09-22', completed: false, color: '#3b82f6' },
        { id: 'm-3', title: 'Stage 3: Editing & Polish', targetDate: '2026-10-01', completed: false, color: '#8b5cf6' },
        { id: 'm-4', title: 'Stage 4: Launch & Distribution', targetDate: '2026-10-15', completed: false, color: '#f59e0b' },
      ],
      createdAt: Date.now() - 86400000 * 9,
    },
    {
      id: 'proj-blog',
      name: 'Launching a blogpost',
      description: 'Drafting announcement blogpost for new AI auto-scheduling features.',
      color: '#2563eb',
      workspace: 'My Private Workspace',
      folder: 'No folder',
      status: 'open',
      priority: 'medium',
      assignee: 'Motion',
      startDate: '2026-09-20',
      targetDate: '2026-10-01',
      milestones: [
        { id: 'b-1', title: 'Draft Outline', targetDate: '2026-09-22', completed: true, color: '#10b981' },
        { id: 'b-2', title: 'Review & Graphics', targetDate: '2026-09-28', completed: false, color: '#3b82f6' },
        { id: 'b-3', title: 'Publish', targetDate: '2026-10-01', completed: false, color: '#8b5cf6' },
      ],
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'proj-video',
      name: 'Motion Tutorial Video',
      description: 'Walkthrough video explaining task duration, hard deadlines, and calendar blocks.',
      color: '#8b5cf6',
      workspace: 'My Private Workspace',
      folder: 'Video editing',
      status: 'open',
      priority: 'normal',
      assignee: 'ES',
      startDate: '2026-09-22',
      targetDate: '2026-10-10',
      milestones: [
        { id: 't-1', title: 'Storyboard', targetDate: '2026-09-26', completed: false, color: '#3b82f6' },
        { id: 't-2', title: 'Animation & VO', targetDate: '2026-10-05', completed: false, color: '#8b5cf6' },
      ],
      createdAt: Date.now() - 86400000 * 1,
    },
  ];
}

function getInitialTasks(): TaskItem[] {
  return [
    {
      id: 'task-1',
      title: 'Draft script & hook outline',
      description: 'Write the outline and key feature walkthrough points for the upcoming video.',
      durationMinutes: 60,
      deadline: '2026-09-18',
      priority: 'high',
      status: 'done',
      projectId: 'proj-yt',
      stageId: 'm-1',
      milestoneId: 'm-1',
      assignee: 'ES',
      scheduledStart: '2026-09-16T09:30:00.000Z',
      scheduledEnd: '2026-09-16T10:30:00.000Z',
      createdAt: Date.now() - 86400000 * 8,
      completedAt: Date.now() - 86400000 * 6,
    },
    {
      id: 'task-2',
      title: 'Review script with product team',
      description: 'Collect feedback on script accuracy and feature coverage.',
      durationMinutes: 30,
      deadline: '2026-09-20',
      priority: 'medium',
      status: 'done',
      projectId: 'proj-yt',
      stageId: 'm-1',
      milestoneId: 'm-1',
      assignee: 'ES',
      scheduledStart: '2026-09-19T14:00:00.000Z',
      scheduledEnd: '2026-09-19T14:30:00.000Z',
      createdAt: Date.now() - 86400000 * 7,
      completedAt: Date.now() - 86400000 * 4,
    },
    {
      id: 'task-3',
      title: 'Record screen walkthroughs & voiceover',
      description: 'High-res 4K recording of the AI auto-schedule flow, conflict banner, and team calendar.',
      durationMinutes: 60,
      deadline: '2026-09-24',
      priority: 'urgent',
      status: 'in_progress',
      projectId: 'proj-yt',
      stageId: 'm-2',
      milestoneId: 'm-2',
      assignee: 'ES',
      scheduledStart: new Date().toISOString(),
      scheduledEnd: new Date(Date.now() + 3600000).toISOString(),
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'task-4',
      title: 'Edit the video (Rough cut & B-roll)',
      description: 'Cut B-roll footage, balance microphone audio, and export first 4k rough cut.',
      durationMinutes: 90,
      deadline: '2026-09-28',
      priority: 'high',
      status: 'todo',
      projectId: 'proj-yt',
      stageId: 'm-2',
      milestoneId: 'm-2',
      assignee: 'ES',
      scheduledStart: new Date(Date.now() + 86400000).toISOString(),
      scheduledEnd: new Date(Date.now() + 86400000 + 5400000).toISOString(),
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'task-5',
      title: 'Design YouTube thumbnails (3 variants)',
      description: 'Render high-contrast Figma mockups for YouTube video title card and run CTR test.',
      durationMinutes: 45,
      deadline: '2026-10-02',
      priority: 'medium',
      status: 'todo',
      projectId: 'proj-yt',
      stageId: 'm-3',
      milestoneId: 'm-3',
      assignee: 'ES',
      scheduledStart: new Date(Date.now() + 86400000 * 3).toISOString(),
      scheduledEnd: new Date(Date.now() + 86400000 * 3 + 2700000).toISOString(),
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'task-6',
      title: 'Audio mastering & color grading',
      description: 'Compress dialogue, EQ high-end frequencies, add dynamic LUT color pass.',
      durationMinutes: 45,
      deadline: '2026-10-05',
      priority: 'medium',
      status: 'todo',
      projectId: 'proj-yt',
      stageId: 'm-3',
      milestoneId: 'm-3',
      assignee: 'ES',
      scheduledStart: new Date(Date.now() + 86400000 * 5).toISOString(),
      scheduledEnd: new Date(Date.now() + 86400000 * 5 + 2700000).toISOString(),
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'task-7',
      title: 'SEO title, tags, description & chapters',
      description: 'Keyword research for search discovery, timestamp breakdown, and pinned comment draft.',
      durationMinutes: 30,
      deadline: '2026-10-12',
      priority: 'medium',
      status: 'todo',
      projectId: 'proj-yt',
      stageId: 'm-4',
      milestoneId: 'm-4',
      assignee: 'ES',
      createdAt: Date.now() - 40000000,
    },
    {
      id: 'task-8',
      title: 'Schedule premiere & community announcement',
      description: 'Schedule YouTube premiere, prep community post, and schedule newsletter blast.',
      durationMinutes: 20,
      deadline: '2026-10-15',
      priority: 'high',
      status: 'todo',
      projectId: 'proj-yt',
      stageId: 'm-4',
      milestoneId: 'm-4',
      assignee: 'ES',
      createdAt: Date.now() - 20000000,
    },
  ];
}

function getInitialEvents(): CalendarEvent[] {
  const now = new Date();
  const d1 = new Date(now);
  d1.setHours(10, 0, 0, 0);
  const d1End = new Date(now);
  d1End.setHours(11, 0, 0, 0);

  const d2 = new Date(now);
  d2.setDate(now.getDate() + 1);
  d2.setHours(14, 0, 0, 0);
  const d2End = new Date(d2);
  d2End.setHours(15, 0, 0, 0);

  return [
    {
      id: 'ev-1',
      title: 'Team Product Sync',
      type: 'meeting',
      startTime: d1.toISOString(),
      endTime: d1End.toISOString(),
      isFixed: true,
      location: 'Google Meet',
      attendees: ['team@motion.app'],
      color: '#2563eb',
    },
    {
      id: 'ev-2',
      title: 'Protected Deep Work',
      type: 'focus_time',
      startTime: d2.toISOString(),
      endTime: d2End.toISOString(),
      isFixed: true,
      color: '#10b981',
    },
  ];
}

function getInitialNotes(): NoteItem[] {
  return [
    {
      id: 'note-1',
      title: 'YouTube Video Script & Review Notes',
      content: `Target length: 6-8 minutes.
Key sections:
1. The problem: constant reorganization of to-do lists.
2. Motion solution: Auto-scheduling tasks into calendar slots.
3. Live demo: Changing a deadline or adding an urgent meeting and watching tasks rearrange automatically.
4. Next steps & call to action.`,
      tags: ['Video', 'YouTube', 'Motion'],
      projectId: 'proj-yt',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
  ];
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentView, setCurrentView] = useState<ViewType>('projects-tasks');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-yt');
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>('task-1');

  const [dialogOpen, setDialogOpen] = useState<DialogType>(null);
  const [dialogData, setDialogData] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tasks && parsed.events) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const initTasks = getInitialTasks();
    const initEvents = getInitialEvents();
    const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
      initTasks,
      initEvents,
      DEFAULT_SETTINGS
    );

    return {
      format: 'kin-workspace',
      version: 3,
      settings: DEFAULT_SETTINGS,
      tasks: scheduledTasks,
      events: calendarEvents,
      projects: getInitialProjects(),
      notes: getInitialNotes(),
      booking: DEFAULT_BOOKING,
      conflicts,
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }, [state]);

  const addToast = useCallback((text: string, isError = false) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, isError }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const openDialog = useCallback((type: DialogType, data: any = null) => {
    setDialogOpen(type);
    setDialogData(data);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(null);
    setDialogData(null);
  }, []);

  const runAutoSchedule = useCallback(() => {
    setState((prev) => {
      const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
        prev.tasks,
        prev.events,
        prev.settings
      );
      return {
        ...prev,
        tasks: scheduledTasks,
        events: calendarEvents,
        conflicts,
      };
    });
    addToast('Schedule recalculation complete');
  }, [addToast]);

  const createTask = useCallback((taskData: Partial<TaskItem>, autoSchedule = true): TaskItem => {
    const id = 'task-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const newTask: TaskItem = {
      id,
      title: taskData.title?.trim() || 'Untitled Task',
      description: taskData.description || '',
      durationMinutes: taskData.durationMinutes || 30,
      deadline: taskData.deadline || '2026-10-05',
      priority: taskData.priority || 'medium',
      status: 'todo',
      projectId: taskData.projectId || selectedProjectId,
      stageId: taskData.stageId || taskData.milestoneId,
      milestoneId: taskData.milestoneId || taskData.stageId,
      workspace: taskData.workspace || 'My Private Workspace',
      folder: taskData.folder || 'No folder',
      assignee: taskData.assignee || 'ES',
      startDate: taskData.startDate || 'Today',
      scheduleType: taskData.scheduleType || 'Work hours',
      labels: taskData.labels || [],
      minChunk: taskData.minChunk || 'No Chunks',
      customFields: taskData.customFields || [],
      hardDeadline: taskData.hardDeadline || false,
      createdAt: Date.now(),
    };

    setState((prev) => {
      const allTasks = [newTask, ...prev.tasks];
      if (prev.settings.autoSchedule && autoSchedule) {
        const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
          allTasks,
          prev.events,
          prev.settings
        );
        return {
          ...prev,
          tasks: scheduledTasks,
          events: calendarEvents,
          conflicts,
        };
      }
      return { ...prev, tasks: allTasks };
    });

    addToast(`Task "${newTask.title}" added`);
    return newTask;
  }, [selectedProjectId, addToast]);

  const updateTask = useCallback((id: string, updates: Partial<TaskItem>, autoSchedule = true) => {
    setState((prev) => {
      const allTasks = prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      if (prev.settings.autoSchedule && autoSchedule) {
        const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
          allTasks,
          prev.events,
          prev.settings
        );
        return {
          ...prev,
          tasks: scheduledTasks,
          events: calendarEvents,
          conflicts,
        };
      }
      return { ...prev, tasks: allTasks };
    });
    addToast('Task updated');
  }, [addToast]);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => {
      const remainingTasks = prev.tasks.filter((t) => t.id !== id);
      const remainingEvents = prev.events.filter((e) => e.taskId !== id);
      const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
        remainingTasks,
        remainingEvents,
        prev.settings
      );
      return {
        ...prev,
        tasks: scheduledTasks,
        events: calendarEvents,
        conflicts,
      };
    });
    addToast('Task removed');
  }, [addToast]);

  const toggleTaskStatus = useCallback((id: string) => {
    setState((prev) => {
      const allTasks = prev.tasks.map((t) => {
        if (t.id === id) {
          const isNowDone = t.status !== 'done';
          return {
            ...t,
            status: isNowDone ? ('done' as const) : ('todo' as const),
            completedAt: isNowDone ? Date.now() : undefined,
          };
        }
        return t;
      });

      const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
        allTasks,
        prev.events,
        prev.settings
      );

      return {
        ...prev,
        tasks: scheduledTasks,
        events: calendarEvents,
        conflicts,
      };
    });
  }, []);

  const toggleTaskLock = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, isLocked: !t.isLocked } : t)),
    }));
  }, []);

  const createEvent = useCallback((evData: Partial<CalendarEvent>): CalendarEvent => {
    const id = 'ev-' + Date.now().toString(36);
    const newEvent: CalendarEvent = {
      id,
      title: evData.title?.trim() || 'New Meeting',
      description: evData.description || '',
      type: evData.type || 'meeting',
      startTime: evData.startTime || new Date().toISOString(),
      endTime: evData.endTime || new Date(Date.now() + 1800000).toISOString(),
      isFixed: true,
      location: evData.location || 'Google Meet',
      attendees: evData.attendees || [],
      color: evData.color || '#2563eb',
    };

    setState((prev) => {
      const allEvents = [...prev.events, newEvent];
      const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
        prev.tasks,
        allEvents,
        prev.settings
      );
      return {
        ...prev,
        tasks: scheduledTasks,
        events: calendarEvents,
        conflicts,
      };
    });

    addToast(`Meeting "${newEvent.title}" scheduled`);
    return newEvent;
  }, [addToast]);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setState((prev) => {
      const allEvents = prev.events.map((e) => (e.id === id ? { ...e, ...updates } : e));
      const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
        prev.tasks,
        allEvents,
        prev.settings
      );
      return {
        ...prev,
        tasks: scheduledTasks,
        events: calendarEvents,
        conflicts,
      };
    });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setState((prev) => {
      const allEvents = prev.events.filter((e) => e.id !== id);
      const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
        prev.tasks,
        allEvents,
        prev.settings
      );
      return {
        ...prev,
        tasks: scheduledTasks,
        events: calendarEvents,
        conflicts,
      };
    });
  }, []);

  const createProject = useCallback((projData: Partial<ProjectItem>): ProjectItem => {
    const id = 'proj-' + Date.now().toString(36);
    const newProject: ProjectItem = {
      id,
      name: projData.name?.trim() || 'New Project',
      description: projData.description || '',
      color: projData.color || '#4b5563',
      workspace: projData.workspace || 'My Private Workspace',
      folder: projData.folder || 'No folder',
      status: projData.status || 'open',
      priority: projData.priority || 'medium',
      assignee: projData.assignee || 'ES',
      startDate: projData.startDate || new Date().toISOString().split('T')[0],
      targetDate: projData.targetDate,
      milestones: projData.milestones || [],
      createdAt: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));

    setSelectedProjectId(newProject.id);
    addToast(`Project "${newProject.name}" created`);
    return newProject;
  }, [addToast]);

  const updateProject = useCallback((id: string, updates: Partial<ProjectItem>) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  }, []);

  const createNote = useCallback((noteData: Partial<NoteItem>): NoteItem => {
    const id = 'note-' + Date.now().toString(36);
    const newNote: NoteItem = {
      id,
      title: noteData.title?.trim() || 'Untitled Doc',
      content: noteData.content || '',
      tags: noteData.tags || [],
      projectId: noteData.projectId || selectedProjectId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setState((prev) => ({ ...prev, notes: [newNote, ...prev.notes] }));
    addToast('Doc created');
    return newNote;
  }, [selectedProjectId, addToast]);

  const updateNote = useCallback((id: string, updates: Partial<NoteItem>) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n)),
    }));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  }, []);

  const updateBooking = useCallback((config: Partial<BookingConfig>) => {
    setState((prev) => ({ ...prev, booking: { ...prev.booking, ...config } }));
  }, []);

  const bookMeetingFromLink = useCallback((
    name: string,
    email: string,
    dateIso: string,
    durationMinutes: number,
    notes = ''
  ): CalendarEvent => {
    const startTime = new Date(dateIso);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    const newEvent: CalendarEvent = {
      id: 'ev-book-' + Date.now().toString(36),
      title: `Meeting with ${name}`,
      description: `Booked via link.\nEmail: ${email}\nNotes: ${notes}`,
      type: 'meeting',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      isFixed: true,
      attendees: [email],
      location: 'Google Meet',
      color: '#2563eb',
    };

    setState((prev) => {
      const allEvents = [...prev.events, newEvent];
      const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
        prev.tasks,
        allEvents,
        prev.settings
      );
      return {
        ...prev,
        tasks: scheduledTasks,
        events: calendarEvents,
        conflicts,
      };
    });

    addToast(`Meeting booked with ${name}. Tasks adjusted automatically!`);
    return newEvent;
  }, [addToast]);

  const resolveConflict = useCallback((conflictId: string, action: 'extend' | 'shorten' | 'urgent') => {
    setState((prev) => {
      const conflict = prev.conflicts.find((c) => c.id === conflictId);
      if (!conflict) return prev;

      let updatedTasks = [...prev.tasks];
      if (action === 'extend') {
        const nextDay = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
        updatedTasks = updatedTasks.map((t) =>
          t.id === conflict.taskId ? { ...t, deadline: nextDay } : t
        );
      } else if (action === 'shorten') {
        updatedTasks = updatedTasks.map((t) =>
          t.id === conflict.taskId ? { ...t, durationMinutes: Math.max(15, Math.round(t.durationMinutes / 2)) } : t
        );
      } else if (action === 'urgent') {
        updatedTasks = updatedTasks.map((t) =>
          t.id === conflict.taskId ? { ...t, priority: 'urgent' } : t
        );
      }

      const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
        updatedTasks,
        prev.events,
        prev.settings
      );

      return {
        ...prev,
        tasks: scheduledTasks,
        events: calendarEvents,
        conflicts,
      };
    });
    addToast('Conflict adjusted');
  }, [addToast]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setState((prev) => {
      const updated = { ...prev.settings, ...newSettings };
      const { scheduledTasks, calendarEvents, conflicts } = calculateSchedule(
        prev.tasks,
        prev.events,
        updated
      );
      return {
        ...prev,
        settings: updated,
        tasks: scheduledTasks,
        events: calendarEvents,
        conflicts,
      };
    });
  }, []);

  const parseAndCreateTaskWithAI = useCallback(async (input: string): Promise<TaskItem> => {
    try {
      const res = await fetch('/api/ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      if (res.ok) {
        const parsed = await res.json();
        return createTask({
          title: parsed.title,
          description: parsed.description,
          durationMinutes: parsed.durationMinutes || 30,
          priority: parsed.priority || 'medium',
          deadline: parsed.deadline || undefined,
          projectId: selectedProjectId,
          assignee: 'Motion',
        });
      }
    } catch (e) {
      console.warn(e);
    }
    return createTask({
      title: input.replace(/^(?:add|create)\s+/i, ''),
      durationMinutes: 30,
      priority: 'medium',
    });
  }, [createTask, selectedProjectId]);

  const generateProjectPlanWithAI = useCallback(async (goal: string, deadline?: string): Promise<any> => {
    const res = await fetch('/api/ai/plan-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, deadline }),
    });
    if (!res.ok) throw new Error('AI planning request failed');
    return res.json();
  }, []);

  const extractMeetingNotesWithAI = useCallback(async (notesContent: string, noteTitle?: string): Promise<any> => {
    const res = await fetch('/api/ai/extract-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notesContent, noteTitle }),
    });
    if (!res.ok) throw new Error('Note extraction failed');
    return res.json();
  }, []);

  const value: AppContextValue = {
    state,
    currentView,
    setCurrentView,
    selectedProjectId,
    setSelectedProjectId,
    activeFocusTaskId,
    setActiveFocusTaskId,
    dialogOpen,
    dialogData,
    openDialog,
    closeDialog,
    toasts,
    addToast,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleTaskLock,
    createEvent,
    updateEvent,
    deleteEvent,
    createProject,
    updateProject,
    deleteProject,
    createNote,
    updateNote,
    deleteNote,
    updateBooking,
    bookMeetingFromLink,
    runAutoSchedule,
    resolveConflict,
    updateSettings,
    parseAndCreateTaskWithAI,
    generateProjectPlanWithAI,
    extractMeetingNotesWithAI,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
