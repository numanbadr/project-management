import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { ROW_HEIGHT } from '@/utils/date';
import type { GanttRow } from '@/types';
import { CLASSIFICATION_COLORS, PRIORITY_CONFIG } from '@/types';

interface GanttSidebarProps {
  rows: GanttRow[];
  onAddProject: () => void;
  onAddTask: (projectId: string) => void;
  onAddSubtask: (taskId: string) => void;
  onDeleteItem: (id: string, type: 'project' | 'task' | 'subtask') => void;
}

export function GanttSidebar({
  rows,
  onAddProject,
  onAddTask,
  onAddSubtask,
  onDeleteItem,
}: GanttSidebarProps) {
  const toggleProjectExpanded = useProjectStore((s) => s.toggleProjectExpanded);
  const toggleTaskExpanded = useProjectStore((s) => s.toggleTaskExpanded);
  const openTaskDetail = useUIStore((s) => s.openTaskDetail);

  function handleToggle(row: GanttRow) {
    if (row.type === 'project') {
      toggleProjectExpanded(row.id);
    } else if (row.type === 'task') {
      toggleTaskExpanded(row.id);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Sidebar header */}
      <div
        className="flex items-center justify-between border-b border-r border-slate-200 bg-slate-50 px-3"
        style={{ height: 56, minHeight: 56 }}
      >
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Projects</span>
        <button
          onClick={onAddProject}
          className="flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-white text-xs hover:bg-blue-600 transition-colors"
          title="Add Project"
        >
          +
        </button>
      </div>

      {/* Sidebar rows */}
      <div className="flex-1">
        {rows.map((row) => (
          <div
            key={row.id}
            className="group flex items-center border-b border-r border-slate-100 hover:bg-slate-50 transition-colors"
            style={{ height: ROW_HEIGHT, paddingLeft: 8 + row.depth * 20 }}
          >
            {/* Expand/collapse toggle */}
            {row.hasChildren ? (
              <button
                onClick={() => handleToggle(row)}
                className="mr-1 flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-600 text-xs"
              >
                {row.isExpanded ? '\u25BE' : '\u25B8'}
              </button>
            ) : (
              <span className="mr-1 w-5" />
            )}

            {/* Color indicator */}
            <span
              className="mr-2 h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: row.projectColor }}
            />

            {/* Name */}
            <button
              onClick={() => openTaskDetail(row.id, row.type)}
              className="flex-1 truncate text-left text-xs text-slate-700 hover:text-blue-600"
              title={row.name}
            >
              {row.name}
            </button>

            {/* Classification / Priority badge */}
            {row.type === 'project' && row.classification && (
              <span
                className="ml-1 flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium text-white"
                style={{ backgroundColor: CLASSIFICATION_COLORS[row.classification] }}
              >
                {row.classification === 'Service Request' ? 'SR' : row.classification}
              </span>
            )}
            {row.type === 'subtask' && row.priority && (
              <span
                className="ml-1 flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium text-white"
                style={{ backgroundColor: PRIORITY_CONFIG[row.priority].color }}
              >
                {row.priority}
              </span>
            )}

            {/* Action buttons (visible on hover) */}
            <div className="ml-1 flex flex-shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {row.type === 'project' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddTask(row.id); }}
                  className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-blue-100 hover:text-blue-600 text-[10px]"
                  title="Add Task"
                >
                  +
                </button>
              )}
              {row.type === 'task' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAddSubtask(row.id); }}
                  className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-blue-100 hover:text-blue-600 text-[10px]"
                  title="Add Subtask"
                >
                  +
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteItem(row.id, row.type); }}
                className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-red-100 hover:text-red-600 text-[10px]"
                title="Delete"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
