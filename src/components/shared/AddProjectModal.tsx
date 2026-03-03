import { useState } from 'react';
import { Modal } from './Modal';
import { useProjectStore } from '@/store/useProjectStore';
import { PROJECT_COLORS, type ProjectClassification } from '@/types';
import { format, addMonths } from 'date-fns';

interface AddProjectModalProps {
  onClose: () => void;
}

export function AddProjectModal({ onClose }: AddProjectModalProps) {
  const addProject = useProjectStore((s) => s.addProject);
  const classifications = useProjectStore((s) => s.classifications);

  const today = format(new Date(), 'yyyy-MM-dd');
  const defaultEnd = format(addMonths(new Date(), 3), 'yyyy-MM-dd');

  const [name, setName] = useState('');
  const [classification, setClassification] = useState<ProjectClassification>(classifications[0]);
  const [color, setColor] = useState(PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)]);
  const [scheduledStart, setScheduledStart] = useState(today);
  const [scheduledEnd, setScheduledEnd] = useState(defaultEnd);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addProject(name.trim(), classification, color, scheduledStart, scheduledEnd);
    onClose();
  }

  return (
    <Modal title="Add Project" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., CCTV Detection System"
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Classification</label>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value as ProjectClassification)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {classifications.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Color</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full border-2 transition-transform ${
                  color === c ? 'border-slate-800 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
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
            Add Project
          </button>
        </div>
      </form>
    </Modal>
  );
}
