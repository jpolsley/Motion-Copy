export type TaskPriority = 'urgent' | 'high' | 'medium' | 'normal' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'scheduled';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number; // 15, 30, 45, 60
  deadline?: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  projectId?: string;
  stageId?: string;
  milestoneId?: string;
  workspace?: string;
  folder?: string;
  assignee?: string;
  startDate?: string;
  scheduleType?: string; // 'Work hours' | 'Personal' | 'Any time'
  labels?: string[];
  customFields?: Array<{ id: string; name: string; value: string }>;
  scheduledStart?: string; // ISO String
  scheduledEnd?: string; // ISO String
  isLocked?: boolean;
  hardDeadline?: boolean;
  minChunk?: string;
  createdAt: number;
  completedAt?: number;
}

export type EventType = 'meeting' | 'task_block' | 'focus_time';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  startTime: string; // ISO String
  endTime: string; // ISO String
  isFixed: boolean;
  location?: string;
  attendees?: string[];
  taskId?: string;
  color?: string;
}

export interface Milestone {
  id: string;
  title: string;
  targetDate?: string;
  deadlineDays?: number;
  completed?: boolean;
  color?: string;
}

export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'on_hold';

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  color?: string;
  targetDate?: string;
  startDate?: string;
  status?: ProjectStatus;
  priority?: TaskPriority;
  assignee?: string;
  workspace?: string;
  folder?: string;
  milestones?: Milestone[];
  createdAt: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  projectId?: string;
  meetingId?: string;
  decisions?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface BookingConfig {
  slug: string;
  title: string;
  description: string;
  durations: number[];
  bufferMinutes: number;
  workingDays: number[];
  startHour: number;
  endHour: number;
  timezone: string;
}

export interface ScheduleConflict {
  id: string;
  taskId: string;
  taskTitle: string;
  deadline: string;
  deficitMinutes: number;
  explanation: string;
  suggestions: string[];
}

export interface UserSettings {
  name: string;
  roleTitle: string;
  workingHours: { start: number; end: number };
  workingDays: number[];
  autoSchedule: boolean;
  protectFocusTime: boolean;
  bufferMinutes: number;
  defaultTaskDuration: number;
}

export type ViewType =
  | 'agenda'
  | 'calendar'
  | 'projects-tasks'
  | 'projects'
  | 'booking'
  | 'team-schedule'
  | 'ai-meeting-notes'
  | 'tutorials';

export type DialogType =
  | null
  | 'task'
  | 'task-drawer'
  | 'project'
  | 'project-ai-template'
  | 'plan-project'
  | 'project-scratch'
  | 'meeting'
  | 'note'
  | 'extract-notes'
  | 'conflict-resolver';

export interface ToastItem {
  id: number;
  text: string;
  isError?: boolean;
}

export interface AppState {
  format: 'kin-workspace';
  version: 3;
  settings: UserSettings;
  tasks: TaskItem[];
  events: CalendarEvent[];
  projects: ProjectItem[];
  notes: NoteItem[];
  booking: BookingConfig;
  conflicts: ScheduleConflict[];
}
