import { PRIORITY_CONFIG, type SubtaskPriority } from '@/types';
import { format, parseISO } from 'date-fns';

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

interface TimelineTaskCardProps {
  item: TimelineItem;
  onClick: () => void;
}

export function TimelineTaskCard({ item, onClick }: TimelineTaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const isCompleted = !!item.actualEnd;
  const isInProgress = !!item.actualStart && !item.actualEnd;

  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Priority indicator */}
      <div
        className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full"
        style={{ backgroundColor: priorityConfig.color }}
        title={priorityConfig.label}
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}
          >
            {item.name}
          </span>
          {item.type === 'subtask' && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">
              subtask
            </span>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2">
          {/* Project badge */}
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: item.projectColor }}
          >
            {item.projectName}
          </span>

          {/* Parent task */}
          {item.parentTaskName && (
            <span className="text-[10px] text-slate-400">
              in {item.parentTaskName}
            </span>
          )}

          {/* Status */}
          {isCompleted && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
              Done
            </span>
          )}
          {isInProgress && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
              In Progress
            </span>
          )}
          {!isCompleted && !isInProgress && (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              Planned
            </span>
          )}
        </div>

        {/* Date range */}
        <p className="mt-1 text-[10px] text-slate-400">
          {format(parseISO(item.scheduledStart), 'MMM d')} - {format(parseISO(item.scheduledEnd), 'MMM d')}
        </p>
      </div>

      {/* Priority badge */}
      <span
        className="flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium text-white"
        style={{ backgroundColor: priorityConfig.color }}
      >
        {item.priority}
      </span>
    </button>
  );
}
