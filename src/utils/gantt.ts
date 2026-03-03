import { parseISO, differenceInDays, isBefore, isAfter } from 'date-fns';
import type { BarSegment, GanttRow, Project, Task, Subtask } from '@/types';

export function computeBarSegments(
  scheduledStart: string,
  scheduledEnd: string,
  actualStart: string | null,
  actualEnd: string | null
): BarSegment[] {
  const sStart = parseISO(scheduledStart);
  const sEnd = parseISO(scheduledEnd);

  // No actual dates - show scheduled only
  if (!actualStart) {
    return [{ startDate: scheduledStart, endDate: scheduledEnd, type: 'scheduled-only' }];
  }

  const aStart = parseISO(actualStart);
  const aEnd = actualEnd ? parseISO(actualEnd) : new Date(); // if in progress, use today

  const segments: BarSegment[] = [];

  // Break into segments based on overlap analysis
  // Possible segments:
  // 1. Before scheduled (actual started early) -> early segment
  // 2. Overlap of both scheduled and actual -> on-schedule
  // 3. Beyond scheduled end (actual extends past) -> delayed
  // 4. After actual end but within scheduled -> early completion (gap = green)

  const overlapStart = isAfter(aStart, sStart) ? aStart : sStart;
  const overlapEnd = isBefore(aEnd, sEnd) ? aEnd : sEnd;

  // Segment: actual started before scheduled
  if (isBefore(aStart, sStart)) {
    segments.push({
      startDate: format(aStart),
      endDate: format(sStart),
      type: 'on-schedule', // Started early - treat as on-schedule
    });
  }

  // Segment: scheduled before actual started (delayed start)
  if (isAfter(aStart, sStart)) {
    segments.push({
      startDate: format(sStart),
      endDate: format(aStart),
      type: 'delayed',
    });
  }

  // Segment: overlap (both scheduled and actual)
  if (isBefore(overlapStart, overlapEnd) || differenceInDays(overlapEnd, overlapStart) === 0) {
    segments.push({
      startDate: format(overlapStart),
      endDate: format(overlapEnd),
      type: 'on-schedule',
    });
  }

  // Segment: actual extends beyond scheduled (delayed)
  if (isAfter(aEnd, sEnd)) {
    segments.push({
      startDate: format(sEnd),
      endDate: format(aEnd),
      type: 'delayed',
    });
  }

  // Segment: actual ended before scheduled (early completion)
  if (actualEnd && isBefore(aEnd, sEnd)) {
    segments.push({
      startDate: format(aEnd),
      endDate: format(sEnd),
      type: 'early',
    });
  }

  return segments.length > 0
    ? segments
    : [{ startDate: scheduledStart, endDate: scheduledEnd, type: 'scheduled-only' }];
}

function format(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function buildGanttRows(
  projects: Record<string, Project>,
  tasks: Record<string, Task>,
  subtasks: Record<string, Subtask>
): GanttRow[] {
  const rows: GanttRow[] = [];

  const sortedProjects = Object.values(projects).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  for (const project of sortedProjects) {
    const projectTasks = Object.values(tasks)
      .filter((t) => t.projectId === project.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    rows.push({
      id: project.id,
      type: 'project',
      name: project.name,
      depth: 0,
      projectColor: project.color,
      classification: project.classification,
      scheduledStart: project.scheduledStart,
      scheduledEnd: project.scheduledEnd,
      actualStart: project.actualStart,
      actualEnd: project.actualEnd,
      isExpanded: project.isExpanded,
      hasChildren: projectTasks.length > 0,
    });

    if (!project.isExpanded) continue;

    for (const task of projectTasks) {
      const taskSubtasks = Object.values(subtasks)
        .filter((s) => s.taskId === task.id)
        .sort((a, b) => a.sortOrder - b.sortOrder);

      rows.push({
        id: task.id,
        type: 'task',
        name: task.name,
        depth: 1,
        projectColor: project.color,
        scheduledStart: task.scheduledStart,
        scheduledEnd: task.scheduledEnd,
        actualStart: task.actualStart,
        actualEnd: task.actualEnd,
        isExpanded: task.isExpanded,
        hasChildren: taskSubtasks.length > 0,
        parentId: project.id,
      });

      if (!task.isExpanded) continue;

      for (const subtask of taskSubtasks) {
        rows.push({
          id: subtask.id,
          type: 'subtask',
          name: subtask.name,
          depth: 2,
          projectColor: project.color,
          priority: subtask.priority,
          scheduledStart: subtask.scheduledStart,
          scheduledEnd: subtask.scheduledEnd,
          actualStart: subtask.actualStart,
          actualEnd: subtask.actualEnd,
          hasChildren: false,
          parentId: task.id,
        });
      }
    }
  }

  return rows;
}
