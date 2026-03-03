import { useState } from 'react';
import { Modal } from './Modal';
import { useProjectStore } from '@/store/useProjectStore';
import { format, addDays } from 'date-fns';
import type { SubtaskPriority } from '@/types';

interface AddSubtaskModalProps {
  taskId: string;
  onClose: () => void;
}

const PRIORITIES: SubtaskPriority[] = ['Urgent', 'Important', 'Normal', 'Low'];

export function AddSubtaskModal({ taskId, onClose }: AddSubtaskModalProps) {
  const addSubtask = useProjectStore((s) => s.addSubtask);
  const task = useProjectStore((s) => s.tasks[taskId]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultEnd = format(addDays(new Date(), 5), 'yyyy-MM-dd');

  const [name, setName] = useState('');
  const [priority, setPriority] = useState<SubtaskPriority>('Normal');
  const [scheduledStart, setScheduledStart] = useState(today);
  const [scheduledEnd, setScheduledEnd] = useState(defaultEnd);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addSubtask(taskId, name.trim(), scheduledStart, scheduledEnd, priority);
    onClose();
  }

  return (
    <Modal title={`Add Subtask to "${task?.name}"`} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Subtask Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Prepare training dataset"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as SubtaskPriority)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Start Date</label>
            <input
              type="date"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">End Date</label>
            <input
              type="date"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Add Subtask
          </button>
        </div>
      </form>
    </Modal>
  );
}
