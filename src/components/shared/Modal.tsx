import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-6xl',
};

export function Modal({ children, onClose, title, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div
        className={`flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-2xl ${SIZE_CLASSES[size]}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
