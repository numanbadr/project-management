import { Suspense, lazy, useRef, useCallback } from 'react';
import { useProjectStore } from '@/store/useProjectStore';

const Excalidraw = lazy(() =>
  import('@excalidraw/excalidraw').then((mod) => ({
    default: mod.Excalidraw,
  }))
);

interface TaskNoteCanvasProps {
  noteId: string | null;
  onEnsureNote: () => string;
}

export function TaskNoteCanvas({ noteId, onEnsureNote }: TaskNoteCanvasProps) {
  const notes = useProjectStore((s) => s.notes);
  const updateNote = useProjectStore((s) => s.updateNote);
  const currentNoteIdRef = useRef<string | null>(noteId);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const note = noteId ? notes[noteId] : null;

  // Parse initial data for Excalidraw
  const initialElements = note
    ? JSON.parse(note.excalidrawElements)
    : [];
  const initialAppState = note
    ? JSON.parse(note.excalidrawAppState)
    : {};
  const initialFiles = note
    ? JSON.parse(note.excalidrawFiles)
    : {};

  const handleChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      // Debounce saves
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        // Ensure note exists
        let id = currentNoteIdRef.current;
        if (!id) {
          id = onEnsureNote();
          currentNoteIdRef.current = id;
        }

        // Only save if there are meaningful elements
        const hasContent = elements.some((el: any) => !el.isDeleted);
        if (hasContent || elements.length === 0) {
          updateNote(id, {
            excalidrawElements: JSON.stringify(elements),
            excalidrawAppState: JSON.stringify({
              viewBackgroundColor: appState.viewBackgroundColor,
              currentItemFontFamily: appState.currentItemFontFamily,
              zoom: appState.zoom,
              scrollX: appState.scrollX,
              scrollY: appState.scrollY,
            }),
            excalidrawFiles: JSON.stringify(files ?? {}),
          });
        }
      }, 800);
    },
    [onEnsureNote, updateNote]
  );

  return (
    <div className="h-full w-full">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Loading canvas...
          </div>
        }
      >
        <Excalidraw
          initialData={{
            elements: initialElements,
            appState: {
              ...initialAppState,
              collaborators: new Map(),
            },
            files: initialFiles,
          }}
          onChange={handleChange}
          UIOptions={{
            canvasActions: {
              saveToActiveFile: false,
              loadScene: false,
              export: false,
            },
          }}
        />
      </Suspense>
    </div>
  );
}
