import { TaskItem, CalendarEvent, UserSettings, ScheduleConflict } from '../types';

/**
 * Intelligent Motion-style auto-scheduler.
 * Places uncompleted, non-locked tasks into available calendar blocks
 * while respecting fixed meetings, working hours, and deadlines.
 */
export function calculateSchedule(
  tasks: TaskItem[],
  existingEvents: CalendarEvent[],
  settings: UserSettings,
  refDate: Date = new Date()
): {
  scheduledTasks: TaskItem[];
  calendarEvents: CalendarEvent[];
  conflicts: ScheduleConflict[];
} {
  const { workingHours, workingDays, bufferMinutes } = settings;

  // 1. Separate fixed commitments (meetings, focus time, locked tasks) from flexible events
  const fixedEvents = existingEvents.filter(
    (ev) => ev.isFixed || ev.type === 'meeting' || ev.type === 'focus_time'
  );

  // 2. Identify locked task items
  const lockedTasksMap = new Map<string, TaskItem>();
  tasks.forEach((t) => {
    if (t.isLocked && t.scheduledStart && t.scheduledEnd && t.status !== 'done') {
      lockedTasksMap.set(t.id, t);
    }
  });

  // Busy intervals list: { start: Date, end: Date, reason: string }
  interface TimeSlot {
    start: Date;
    end: Date;
    sourceId?: string;
  }

  const busySlots: TimeSlot[] = [];

  // Add fixed events with buffer
  fixedEvents.forEach((ev) => {
    const s = new Date(new Date(ev.startTime).getTime() - bufferMinutes * 60000);
    const e = new Date(new Date(ev.endTime).getTime() + bufferMinutes * 60000);
    busySlots.push({ start: s, end: e, sourceId: ev.id });
  });

  // Add locked tasks as fixed blocks
  lockedTasksMap.forEach((t) => {
    if (t.scheduledStart && t.scheduledEnd) {
      busySlots.push({
        start: new Date(t.scheduledStart),
        end: new Date(t.scheduledEnd),
        sourceId: t.id,
      });
    }
  });

  // 3. Sort tasks that need scheduling:
  // Non-done, non-locked tasks
  const tasksToSchedule = tasks
    .filter((t) => t.status !== 'done' && !t.isLocked)
    .sort((a, b) => {
      // 1st: Priority weight
      const pWeights: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
      const diffP = (pWeights[b.priority] || 2) - (pWeights[a.priority] || 2);
      if (diffP !== 0) return diffP;

      // 2nd: Earliest deadline first
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;

      // 3rd: Created date
      return a.createdAt - b.createdAt;
    });

  const scheduledTasks: TaskItem[] = [];
  const generatedEvents: CalendarEvent[] = [...fixedEvents];
  const conflicts: ScheduleConflict[] = [];

  // Start search pointer: Round refDate up to the nearest 15-minute slot
  let searchCursor = new Date(refDate);
  const minutes = searchCursor.getMinutes();
  const remainder = 15 - (minutes % 15);
  searchCursor.setMinutes(minutes + (remainder === 15 ? 0 : remainder));
  searchCursor.setSeconds(0);
  searchCursor.setMilliseconds(0);

  // Helper to check if a specific time is within working hours
  function isWorkingHour(d: Date): boolean {
    const day = d.getDay(); // 0 is Sunday, 1 is Mon...
    if (!workingDays.includes(day)) return false;
    const hour = d.getHours() + d.getMinutes() / 60;
    return hour >= workingHours.start && hour < workingHours.end;
  }

  // Helper to jump cursor to the next valid working time
  function advanceToNextWorkingSlot(d: Date): Date {
    const next = new Date(d);
    while (true) {
      const day = next.getDay();
      const currentDecHour = next.getHours() + next.getMinutes() / 60;

      // If weekend / non-working day, advance to next day at startHour
      if (!workingDays.includes(day)) {
        next.setDate(next.getDate() + 1);
        next.setHours(workingHours.start, 0, 0, 0);
        continue;
      }

      // If before working hours today, advance to startHour
      if (currentDecHour < workingHours.start) {
        next.setHours(workingHours.start, 0, 0, 0);
        return next;
      }

      // If after working hours today, jump to tomorrow startHour
      if (currentDecHour >= workingHours.end) {
        next.setDate(next.getDate() + 1);
        next.setHours(workingHours.start, 0, 0, 0);
        continue;
      }

      // We are in working hours!
      return next;
    }
  }

  // Schedule each task sequentially
  for (const task of tasksToSchedule) {
    const durationMs = (task.durationMinutes || 30) * 60000;
    let placed = false;
    let candidateStart = advanceToNextWorkingSlot(new Date(searchCursor));

    // Try finding slot over next 14 days
    const maxLookaheadMs = 14 * 24 * 3600000;
    const limitTime = refDate.getTime() + maxLookaheadMs;

    while (candidateStart.getTime() < limitTime && !placed) {
      candidateStart = advanceToNextWorkingSlot(candidateStart);
      const candidateEnd = new Date(candidateStart.getTime() + durationMs);

      // Check if candidateEnd is still within working hours of candidateStart's day
      const endDecHour = candidateEnd.getHours() + candidateEnd.getMinutes() / 60;
      if (endDecHour > workingHours.end || candidateEnd.getDate() !== candidateStart.getDate()) {
        // Doesn't fit in remaining day hours; jump to next day
        candidateStart.setDate(candidateStart.getDate() + 1);
        candidateStart.setHours(workingHours.start, 0, 0, 0);
        continue;
      }

      // Check collision with busy slots
      const collision = busySlots.find(
        (b) => candidateStart < b.end && candidateEnd > b.start
      );

      if (collision) {
        // Jump cursor to end of collision and test again
        candidateStart = new Date(collision.end);
        // Round to 15 mins
        const m = candidateStart.getMinutes();
        const rem = 15 - (m % 15);
        if (rem < 15) candidateStart.setMinutes(m + rem);
        candidateStart.setSeconds(0);
        candidateStart.setMilliseconds(0);
        continue;
      }

      // Slot is free! Place task here
      const startIso = candidateStart.toISOString();
      const endIso = candidateEnd.toISOString();

      const updatedTask: TaskItem = {
        ...task,
        status: task.status === 'todo' ? 'scheduled' : task.status,
        scheduledStart: startIso,
        scheduledEnd: endIso,
      };
      scheduledTasks.push(updatedTask);

      // Register busy slot
      busySlots.push({ start: candidateStart, end: candidateEnd, sourceId: task.id });

      // Add to generated calendar events
      generatedEvents.push({
        id: `ev-task-${task.id}`,
        title: task.title,
        description: task.description || `Task block (${task.durationMinutes}m)`,
        type: 'task_block',
        startTime: startIso,
        endTime: endIso,
        isFixed: false,
        taskId: task.id,
        color: task.priority === 'urgent' ? '#e05353' : task.priority === 'high' ? '#e08a53' : '#82a27b',
      });

      // Deadline verification & Conflict check
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline + 'T23:59:59');
        if (candidateEnd > deadlineDate) {
          const hoursLate = Math.round(((candidateEnd.getTime() - deadlineDate.getTime()) / 3600000) * 10) / 10;
          conflicts.push({
            id: `conf-${task.id}`,
            taskId: task.id,
            taskTitle: task.title,
            deadline: task.deadline,
            deficitMinutes: Math.round(hoursLate * 60),
            explanation: `"${task.title}" is scheduled to complete ${hoursLate}h past its deadline (${task.deadline}) due to existing calendar commitments.`,
            suggestions: [
              `Extend deadline for "${task.title}" to ${candidateEnd.toISOString().split('T')[0]}`,
              `Shorten estimated time from ${task.durationMinutes}m to 30m`,
              `Promote priority to 'Urgent' to schedule before lower priority items`,
            ],
          });
        }
      }

      // Advance search cursor slightly for next item
      searchCursor = new Date(candidateEnd);
      placed = true;
    }

    if (!placed) {
      // Could not place within 14 days
      conflicts.push({
        id: `conf-noplace-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        deadline: task.deadline || 'None',
        deficitMinutes: task.durationMinutes,
        explanation: `Unable to find an open ${task.durationMinutes}m work block for "${task.title}" within the next 2 weeks.`,
        suggestions: [
          'Add weekend/evening hours in Settings',
          'Break this task into 15-minute sub-tasks',
        ],
      });
      scheduledTasks.push(task);
    }
  }

  // Include locked tasks into output
  lockedTasksMap.forEach((t) => {
    scheduledTasks.push(t);
    // Also ensure its event is in generatedEvents
    if (!generatedEvents.some((ev) => ev.taskId === t.id)) {
      generatedEvents.push({
        id: `ev-task-${t.id}`,
        title: t.title,
        description: t.description,
        type: 'task_block',
        startTime: t.scheduledStart!,
        endTime: t.scheduledEnd!,
        isFixed: true,
        taskId: t.id,
        color: '#7ba29d',
      });
    }
  });

  // Include tasks that were already done
  tasks
    .filter((t) => t.status === 'done')
    .forEach((t) => scheduledTasks.push(t));

  return {
    scheduledTasks,
    calendarEvents: generatedEvents,
    conflicts,
  };
}
