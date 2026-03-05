import { useMemo } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import {
  format,
  parseISO,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isWithinInterval,
  startOfDay,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { TimelineTaskCard } from './TimelineTaskCard';
import { PRIORITY_CONFIG, type SubtaskPriority } from '@/types';
import { TaskDetailModal } from '@/components/task-detail/TaskDetailModal';

const PRIORITY_ORDER: Record<SubtaskPriority, number> = {
  Urgent: 0,
  Important: 1,
  Normal: 2,
  Low: 3,
};

interface TimelineItem {
  id: string;
  name: string;
  type: 'task' | 'subtask';
  projectName: string;
  projectColor: string;
  priority: SubtaskPriority;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  parentTaskName?: string;
}

export function TimelineView() {
  const projects = useProjectStore((s) => s.projects);
  const tasks = useProjectStore((s) => s.tasks);
  const subtasks = useProjectStore((s) => s.subtasks);

  const timelineViewMode = useUIStore((s) => s.timelineViewMode);
  const setTimelineViewMode = useUIStore((s) => s.setTimelineViewMode);
  const timelineDate = useUIStore((s) => s.timelineDate);
  const setTimelineDate = useUIStore((s) => s.setTimelineDate);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const isTaskDetailOpen = useUIStore((s) => s.isTaskDetailOpen);

  const currentDate = parseISO(timelineDate);

  const dateRange = useMemo(() => {
    if (timelineViewMode === 'day') {
      return { start: startOfDay(currentDate), end: startOfDay(currentDate) };
    }
    const ws = startOfWeek(currentDate, { weekStartsOn: 1 });
    const we = endOfWeek(currentDate, { weekStartsOn: 1 });
    return { start: ws, end: we };
  }, [currentDate, timelineViewMode]);

  const daysInRange = useMemo(
    () => eachDayOfInterval(dateRange),
    [dateRange]
  );

  const itemsByDay = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();

    for (const day of daysInRange) {
      map.set(format(day, 'yyyy-MM-dd'), []);
    }

    for (const task of Object.values(tasks)) {
      const project = projects[task.projectId];
      if (!project) continue;

      for (const day of daysInRange) {
        const dayKey = format(day, 'yyyy-MM-dd');
        const taskStart = parseISO(task.scheduledStart);
        const taskEnd = parseISO(task.scheduledEnd);

        if (
          isWithinInterval(startOfDay(day), {
            start: startOfDay(taskStart),
            end: addDays(startOfDay(taskEnd), 1),
          })
        ) {
          const items = map.get(dayKey)!;
          if (!items.some((it) => it.id === task.id)) {
            items.push({
              id: task.id,
              name: task.name,
              type: 'task',
              projectName: project.name,
              projectColor: project.color,
              priority: 'Normal',
              scheduledStart: task.scheduledStart,
              scheduledEnd: task.scheduledEnd,
              actualStart: task.actualStart,
              actualEnd: task.actualEnd,
            });
          }
        }
      }

      for (const subtask of Object.values(subtasks)) {
        if (subtask.taskId !== task.id) continue;
        const proj = projects[subtask.projectId];
        if (!proj) continue;

        for (const day of daysInRange) {
          const dayKey = format(day, 'yyyy-MM-dd');
          const subStart = parseISO(subtask.scheduledStart);
          const subEnd = parseISO(subtask.scheduledEnd);

          if (
            isWithinInterval(startOfDay(day), {
              start: startOfDay(subStart),
              end: addDays(startOfDay(subEnd), 1),
            })
          ) {
            const items = map.get(dayKey)!;
            if (!items.some((it) => it.id === subtask.id)) {
              items.push({
                id: subtask.id,
                name: subtask.name,
                type: 'subtask',
                projectName: proj.name,
                projectColor: proj.color,
                priority: subtask.priority,
                scheduledStart: subtask.scheduledStart,
                scheduledEnd: subtask.scheduledEnd,
                actualStart: subtask.actualStart,
                actualEnd: subtask.actualEnd,
                parentTaskName: task.name,
              });
            }
          }
        }
      }
    }

    for (const [, items] of map) {
      items.sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      );
    }

    return map;
  }, [daysInRange, projects, tasks, subtasks]);

  function navigateBack() {
    if (timelineViewMode === 'day') {
      setTimelineDate(format(subDays(currentDate, 1), 'yyyy-MM-dd'));
    } else {
      setTimelineDate(format(subWeeks(currentDate, 1), 'yyyy-MM-dd'));
    }
  }

  function navigateForward() {
    if (timelineViewMode === 'day') {
      setTimelineDate(format(addDays(currentDate, 1), 'yyyy-MM-dd'));
    } else {
      setTimelineDate(format(addWeeks(currentDate, 1), 'yyyy-MM-dd'));
    }
  }

  function goToToday() {
    setTimelineDate(format(new Date(), 'yyyy-MM-dd'));
  }

  return (
    <div className="flex h-full flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => setTimelineViewMode('day')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                timelineViewMode === 'day'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setTimelineViewMode('week')}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                timelineViewMode === 'week'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={navigateBack}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            &larr;
          </button>
          <button
            onClick={goToToday}
            className="rounded-md px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            Today
          </button>
          <button
            onClick={navigateForward}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            &rarr;
          </button>

          <span className="text-sm font-medium text-slate-700">
            {timelineViewMode === 'day'
              ? format(currentDate, 'EEEE, MMMM d, yyyy')
              : `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: cfg.color }}
              />
              {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content - vertical scroll */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
        {daysInRange.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const items = itemsByDay.get(dayKey) ?? [];
          const isToday = format(new Date(), 'yyyy-MM-dd') === dayKey;

          return (
            <div key={dayKey} className="mb-4">
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    isToday
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div>
                  <p className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                    {format(day, 'EEEE')}
                    {isToday && <span className="ml-2 text-xs font-normal text-blue-400">Today</span>}
                  </p>
                  <p className="text-[10px] text-slate-400">{format(day, 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="ml-10 rounded-lg border border-dashed border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
                  No tasks scheduled
                </p>
              ) : (
                <div className="ml-10 flex flex-col gap-2">
                  {items.map((item) => (
                    <TimelineTaskCard
                      key={item.id}
                      item={item}
                      onClick={() => openTaskDetail(item.id, item.type)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isTaskDetailOpen && <TaskDetailModal />}
    </div>
  );
}
