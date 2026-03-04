import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '@/store/useUIStore';
import { useProjectStore } from '@/store/useProjectStore';
import { TaskMetadata } from './TaskMetadata';
import { TaskNoteCanvas } from './TaskNoteCanvas';
import {
  NOTE_TYPE_LABELS,
  type NoteType,
} from '@/types';

const NOTE_TYPES: NoteType[] = [
  'meeting-details',
  'project-requirement',
  'timeline',
  'to-do-list',
  'kiv',
  'others',
];

export function TaskDetailModal() {
  const selectedItemId = useUIStore((s) => s.selectedItemId);
  const selectedItemType = useUIStore((s) => s.selectedItemType);
  const closeTaskDetail = useUIStore((s) => s.closeTaskDetail);
  const addNote = useProjectStore((s) => s.addNote);
  const getNotesForParent = useProjectStore((s) => s.getNotesForParent);

  const [activeNoteType, setActiveNoteType] = useState<NoteType>('to-do-list');

  if (!selectedItemId || !selectedItemType) return null;

  const parentNotes = getNotesForParent(selectedItemId);
  const activeNote = parentNotes.find((n) => n.noteType === activeNoteType);

  const handleEnsureNote = useCallback(() => {
    if (!activeNote) {
      const id = addNote(
        selectedItemId!,
        selectedItemType!,
        activeNoteType,
        NOTE_TYPE_LABELS[activeNoteType]
      );
      return id;
    }
    return activeNote.id;
  }, [activeNote, addNote, selectedItemId, selectedItemType, activeNoteType]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={closeTaskDetail}
    >
      <div
        className="flex h-[85vh] w-full max-w-6xl flex-col rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-800">
            {selectedItemType === 'project' ? 'Project' : selectedItemType === 'task' ? 'Task' : 'Subtask'} Details
          </h2>
          <button
            onClick={closeTaskDetail}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Metadata */}
          <div className="w-[320px] flex-shrink-0 overflow-y-auto border-r border-slate-200 p-4">
            <TaskMetadata itemId={selectedItemId} itemType={selectedItemType} />
          </div>

          {/* Right: Notes */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Note type tabs */}
            <div className="flex flex-shrink-0 gap-1 border-b border-slate-200 px-4 pt-2">
              {NOTE_TYPES.map((nt) => {
                const hasContent = parentNotes.some((n) => n.noteType === nt);
                return (
                  <button
                    key={nt}
                    onClick={() => setActiveNoteType(nt)}
                    className={`relative rounded-t-md px-3 py-2 text-xs font-medium transition-colors ${
                      activeNoteType === nt
                        ? 'bg-white text-blue-600 border border-slate-200 border-b-white -mb-px'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {NOTE_TYPE_LABELS[nt]}
                    {hasContent && (
                      <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Excalidraw canvas */}
            <div className="flex-1 overflow-hidden">
              <TaskNoteCanvas
                key={`${selectedItemId}-${activeNoteType}`}
                noteId={activeNote?.id ?? null}
                onEnsureNote={handleEnsureNote}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
