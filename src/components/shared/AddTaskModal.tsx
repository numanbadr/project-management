import { useState } from 'react';
import { Modal } from './Modal';
import { useProjectStore } from '@/store/useProjectStore';
import { format, addWeeks } from 'date-fns';

interface AddTaskModalProps {
  projectId: string;
  onClose: () => void;
}

export function AddTaskModal({ projectId, onClose }: AddTaskModalProps) {
  const addTask = useProjectStore((s) => s.addTask);
  const project = useProjectStore((s) => s.projects[projectId]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultEnd = format(addWeeks(new Date(), 2), 'yyyy-MM-dd');

  const [name, setName] = useState('');
  const [scheduledStart, setScheduledStart] = useState(today);
  const [scheduledEnd, setScheduledEnd] = useState(defaultEnd);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addTask(projectId, name.trim(), scheduledStart, scheduledEnd);
    onClose();
  }

  return (
    <Modal title={`Add Task to "${project?.name}"`} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Task Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., Requirement Gathering"
            autoFocus
          />
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
            Add Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
