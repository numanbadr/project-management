import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
}: ConfirmDialogProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
