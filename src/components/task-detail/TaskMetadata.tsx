import { useProjectStore } from '@/store/useProjectStore';
import {
  CLASSIFICATION_COLORS,
  PRIORITY_CONFIG,
  type ProjectClassification,
  type SubtaskPriority,
} from '@/types';
import { formatDateRange } from '@/utils/date';

interface TaskMetadataProps {
  itemId: string;
  itemType: 'project' | 'task' | 'subtask';
}

export function TaskMetadata({ itemId, itemType }: TaskMetadataProps) {
  const projects = useProjectStore((s) => s.projects);
  const tasks = useProjectStore((s) => s.tasks);
  const subtasks = useProjectStore((s) => s.subtasks);
  const updateProject = useProjectStore((s) => s.updateProject);
  const updateTask = useProjectStore((s) => s.updateTask);
  const updateSubtask = useProjectStore((s) => s.updateSubtask);
  const classifications = useProjectStore((s) => s.classifications);

  let item: {
    name: string;
    scheduledStart: string;
    scheduledEnd: string;
    actualStart: string | null;
    actualEnd: string | null;
    classification?: ProjectClassification;
    priority?: SubtaskPriority;
    projectColor?: string;
  } | null = null;

  if (itemType === 'project') {
    const p = projects[itemId];
    if (p) item = { ...p, projectColor: p.color };
  } else if (itemType === 'task') {
    const t = tasks[itemId];
    if (t) {
      const p = projects[t.projectId];
      item = { ...t, projectColor: p?.color };
    }
  } else {
    const s = subtasks[itemId];
    if (s) {
      const p = projects[s.projectId];
      item = { ...s, projectColor: p?.color };
    }
  }

  if (!item) return <p className="text-sm text-slate-500">Item not found</p>;

  function handleNameChange(name: string) {
    if (itemType === 'project') updateProject(itemId, { name });
    else if (itemType === 'task') updateTask(itemId, { name });
    else updateSubtask(itemId, { name });
  }

  function handleDateChange(field: string, value: string) {
    const update = { [field]: value || null };
    if (itemType === 'project') updateProject(itemId, update);
    else if (itemType === 'task') updateTask(itemId, update);
    else updateSubtask(itemId, update);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Name */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Name</label>
        <input
          type="text"
          value={item.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Project indicator */}
      {item.projectColor && (
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.projectColor }}
          />
          <span className="text-xs text-slate-600">
            {itemType === 'project'
              ? 'Project'
              : itemType === 'task'
                ? `Task in ${projects[tasks[itemId]?.projectId]?.name}`
                : `Subtask in ${tasks[subtasks[itemId]?.taskId]?.name}`}
          </span>
        </div>
      )}

      {/* Classification (projects only) */}
      {itemType === 'project' && (
        <div>
          <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Classification</label>
          <select
            value={item.classification ?? ''}
            onChange={(e) => updateProject(itemId, { classification: e.target.value as ProjectClassification })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {classifications.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {item.classification && (
            <span
              className="mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: CLASSIFICATION_COLORS[item.classification] }}
            >
              {item.classification}
            </span>
          )}
        </div>
      )}

      {/* Priority (subtasks only) */}
      {itemType === 'subtask' && (
        <div>
          <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
          <select
            value={item.priority ?? 'Normal'}
            onChange={(e) => updateSubtask(itemId, { priority: e.target.value as SubtaskPriority })}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Scheduled dates */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Scheduled</label>
        <p className="text-xs text-slate-600 mb-2">
          {formatDateRange(item.scheduledStart, item.scheduledEnd)}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400">Start</label>
            <input
              type="date"
              value={item.scheduledStart}
              onChange={(e) => handleDateChange('scheduledStart', e.target.value)}
              className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400">End</label>
            <input
              type="date"
              value={item.scheduledEnd}
              onChange={(e) => handleDateChange('scheduledEnd', e.target.value)}
              className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Actual dates */}
      <div>
        <label className="mb-1 block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actual</label>
        {item.actualStart ? (
          <p className="text-xs text-slate-600 mb-2">
            {item.actualEnd
              ? formatDateRange(item.actualStart, item.actualEnd)
              : `Started ${item.actualStart} (in progress)`}
          </p>
        ) : (
          <p className="text-xs text-slate-400 mb-2">Not started</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400">Start</label>
            <input
              type="date"
              value={item.actualStart ?? ''}
              onChange={(e) => handleDateChange('actualStart', e.target.value)}
              className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400">End</label>
            <input
              type="date"
              value={item.actualEnd ?? ''}
              onChange={(e) => handleDateChange('actualEnd', e.target.value)}
              className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
