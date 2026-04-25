import { useEffect, useRef, type ReactNode } from 'react';
import { COLORS } from '../../constants/colors';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  /** @default true */
  closeOnBackdropClick?: boolean;
}

export default function Modal({
  open,
  onOpenChange,
  children,
  className = '',
  closeOnBackdropClick = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    }
    if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="h-full max-h-[100dvh] w-full max-w-[100vw] border-0 bg-transparent p-0 backdrop:bg-black/45 backdrop:backdrop-blur-[1px]"
      style={{ color: COLORS.textPrimary }}
      onClose={() => onOpenChange(false)}
    >
      <div
        className="flex min-h-full w-full items-center justify-center p-4"
        onClick={() => {
          if (closeOnBackdropClick) onOpenChange(false);
        }}
      >
        <div
          className={`max-h-[min(90vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto rounded-2xl border bg-white p-6 shadow-xl ${className}`.trim()}
          style={{ borderColor: COLORS.border }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </dialog>
  );
}
