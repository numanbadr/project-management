import { useUIStore } from '@/store/useUIStore';
import type { GanttViewMode } from '@/types';

const VIEW_MODES: { value: GanttViewMode; label: string }[] = [
  { value: 'daily', label: 'Day' },
  { value: 'weekly', label: 'Week' },
  { value: 'monthly', label: 'Month' },
];

export function GanttViewControls() {
  const ganttViewMode = useUIStore((s) => s.ganttViewMode);
  const setGanttViewMode = useUIStore((s) => s.setGanttViewMode);

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
      {VIEW_MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setGanttViewMode(mode.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            ganttViewMode === mode.value
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
