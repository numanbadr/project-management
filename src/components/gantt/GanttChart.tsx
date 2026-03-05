import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { buildGanttRows } from '@/utils/gantt';
import {
  getTimelineRange,
  getColumns,
  getTotalWidth,
  getTodayX,
  ROW_HEIGHT,
} from '@/utils/date';
import { GanttHeader } from './GanttHeader';
import { GanttSidebar } from './GanttSidebar';
import { GanttBar } from './GanttBar';
import { GanttViewControls } from './GanttViewControls';
import { SvgPatternDefs } from './SvgPatternDefs';
import { AddProjectModal } from '@/components/shared/AddProjectModal';
import { AddTaskModal } from '@/components/shared/AddTaskModal';
import { AddSubtaskModal } from '@/components/shared/AddSubtaskModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TaskDetailModal } from '@/components/task-detail/TaskDetailModal';

export function GanttChart() {
  const projects = useProjectStore((s) => s.projects);
  const tasks = useProjectStore((s) => s.tasks);
  const subtasks = useProjectStore((s) => s.subtasks);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const deleteTask = useProjectStore((s) => s.deleteTask);
  const deleteSubtask = useProjectStore((s) => s.deleteSubtask);

  const ganttViewMode = useUIStore((s) => s.ganttViewMode);
  const sidebarWidth = useUIStore((s) => s.sidebarWidth);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);
  const isTaskDetailOpen = useUIStore((s) => s.isTaskDetailOpen);

  const sidebarBodyRef = useRef<HTMLDivElement>(null);
  const timelineBodyRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollingSourceRef = useRef<string | null>(null);

  // Modal state
  const [showAddProject, setShowAddProject] = useState(false);
  const [addTaskProjectId, setAddTaskProjectId] = useState<string | null>(null);
  const [addSubtaskTaskId, setAddSubtaskTaskId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    type: 'project' | 'task' | 'subtask';
    name: string;
  } | null>(null);

  // Compute rows
  const rows = useMemo(
    () => buildGanttRows(projects, tasks, subtasks),
    [projects, tasks, subtasks]
  );

  // Compute timeline
  const { start: timelineStart, end: timelineEnd } = useMemo(getTimelineRange, []);
  const { columns, monthHeaders } = useMemo(
    () => getColumns(timelineStart, timelineEnd, ganttViewMode),
    [timelineStart, timelineEnd, ganttViewMode]
  );
  const totalWidth = useMemo(
    () => getTotalWidth(timelineStart, timelineEnd, ganttViewMode),
    [timelineStart, timelineEnd, ganttViewMode]
  );
  const todayX = useMemo(
    () => getTodayX(timelineStart, ganttViewMode),
    [timelineStart, ganttViewMode]
  );
  const totalHeight = rows.length * ROW_HEIGHT;

  // Sync scrolling
  const handleTimelineScroll = useCallback(() => {
    const el = timelineBodyRef.current;
    if (!el || scrollingSourceRef.current === 'sidebar') return;
    scrollingSourceRef.current = 'timeline';

    if (sidebarBodyRef.current) {
      sidebarBodyRef.current.scrollTop = el.scrollTop;
    }
    if (headerRef.current) {
      headerRef.current.scrollLeft = el.scrollLeft;
    }

    requestAnimationFrame(() => {
      scrollingSourceRef.current = null;
    });
  }, []);

  const handleSidebarScroll = useCallback(() => {
    const el = sidebarBodyRef.current;
    if (!el || scrollingSourceRef.current === 'timeline') return;
    scrollingSourceRef.current = 'sidebar';

    if (timelineBodyRef.current) {
      timelineBodyRef.current.scrollTop = el.scrollTop;
    }

    requestAnimationFrame(() => {
      scrollingSourceRef.current = null;
    });
  }, []);

  // Auto-scroll to today on mount and view mode change
  useEffect(() => {
    const el = timelineBodyRef.current;
    if (!el) return;

    const containerWidth = el.clientWidth;
    const scrollTo = todayX - containerWidth / 3;
    el.scrollLeft = Math.max(0, scrollTo);

    if (headerRef.current) {
      headerRef.current.scrollLeft = el.scrollLeft;
    }
  }, [todayX, ganttViewMode]);

  // Delete handler
  function handleDelete() {
    if (!deleteConfirm) return;
    const { id, type } = deleteConfirm;
    if (type === 'project') deleteProject(id);
    else if (type === 'task') deleteTask(id);
    else deleteSubtask(id);
    setDeleteConfirm(null);
  }

  function getItemName(id: string, type: 'project' | 'task' | 'subtask'): string {
    if (type === 'project') return projects[id]?.name ?? 'Project';
    if (type === 'task') return tasks[id]?.name ?? 'Task';
    return subtasks[id]?.name ?? 'Subtask';
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-3">
          <GanttViewControls />
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-6 rounded-sm border border-slate-300" style={{ background: 'linear-gradient(90deg, #3b82f6 100%, transparent 0)' }} />
              On schedule
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-6 rounded-sm border border-red-300" style={{ background: 'repeating-linear-gradient(45deg, #fecaca, #fecaca 2px, #ef4444 2px, #ef4444 4px)' }} />
              Delayed
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-6 rounded-sm border border-green-300" style={{ background: 'radial-gradient(circle, #22c55e 1.5px, #dcfce7 1.5px)', backgroundSize: '6px 6px' }} />
              Early
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-6 rounded-sm border border-slate-300 bg-slate-200" />
              Scheduled
            </span>
          </div>
        </div>
      </div>

      {/* Main Gantt area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="flex flex-col border-r border-slate-200 bg-white flex-shrink-0"
          style={{ width: sidebarWidth }}
        >
          <div
            ref={sidebarBodyRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
            onScroll={handleSidebarScroll}
            style={{ scrollbarWidth: 'none' }}
          >
            <GanttSidebar
              rows={rows}
              onAddProject={() => setShowAddProject(true)}
              onAddTask={(projectId) => setAddTaskProjectId(projectId)}
              onAddSubtask={(taskId) => setAddSubtaskTaskId(taskId)}
              onDeleteItem={(id, type) =>
                setDeleteConfirm({ id, type, name: getItemName(id, type) })
              }
            />
          </div>
        </div>

        {/* Timeline area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header (fixed) */}
          <div
            ref={headerRef}
            className="overflow-hidden border-b border-slate-200 flex-shrink-0"
            style={{ scrollbarWidth: 'none' }}
          >
            <GanttHeader
              columns={columns}
              monthHeaders={monthHeaders}
              totalWidth={totalWidth}
              todayX={todayX}
              showMonthHeaders={ganttViewMode !== 'monthly'}
            />
          </div>

          {/* Timeline body (scrollable) */}
          <div
            ref={timelineBodyRef}
            className="flex-1 overflow-auto"
            onScroll={handleTimelineScroll}
          >
            <svg
              width={totalWidth}
              height={Math.max(totalHeight, 200)}
              className="block"
            >
              <SvgPatternDefs />

              {/* Background grid lines */}
              {columns.map((col) => (
                <line
                  key={`grid-${col.x}`}
                  x1={col.x}
                  y1={0}
                  x2={col.x}
                  y2={Math.max(totalHeight, 200)}
                  stroke="#f1f5f9"
                  strokeWidth={1}
                />
              ))}

              {/* Row alternating backgrounds */}
              {rows.map((_, i) => (
                <rect
                  key={`row-bg-${i}`}
                  x={0}
                  y={i * ROW_HEIGHT}
                  width={totalWidth}
                  height={ROW_HEIGHT}
                  fill={i % 2 === 0 ? 'transparent' : '#fafbfc'}
                />
              ))}

              {/* Row separator lines */}
              {rows.map((_, i) => (
                <line
                  key={`row-line-${i}`}
                  x1={0}
                  y1={(i + 1) * ROW_HEIGHT}
                  x2={totalWidth}
                  y2={(i + 1) * ROW_HEIGHT}
                  stroke="#f1f5f9"
                  strokeWidth={0.5}
                />
              ))}

              {/* Today vertical line */}
              <line
                x1={todayX}
                y1={0}
                x2={todayX}
                y2={Math.max(totalHeight, 200)}
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.6}
              />

              {/* Bars */}
              {rows.map((row, i) => (
                <GanttBar
                  key={row.id}
                  row={row}
                  rowIndex={i}
                  timelineStart={timelineStart}
                  viewMode={ganttViewMode}
                  onClick={() => openTaskDetail(row.id, row.type)}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddProject && (
        <AddProjectModal onClose={() => setShowAddProject(false)} />
      )}
      {addTaskProjectId && (
        <AddTaskModal
          projectId={addTaskProjectId}
          onClose={() => setAddTaskProjectId(null)}
        />
      )}
      {addSubtaskTaskId && (
        <AddSubtaskModal
          taskId={addSubtaskTaskId}
          onClose={() => setAddSubtaskTaskId(null)}
        />
      )}
      {deleteConfirm && (
        <ConfirmDialog
          title={`Delete ${deleteConfirm.type}?`}
          message={`Are you sure you want to delete "${deleteConfirm.name}"? ${
            deleteConfirm.type === 'project'
              ? 'All tasks and subtasks will also be deleted.'
              : deleteConfirm.type === 'task'
                ? 'All subtasks will also be deleted.'
                : ''
          }`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
      {isTaskDetailOpen && <TaskDetailModal />}
    </div>
  );
}
