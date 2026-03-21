// shadcn/ui component: Dialog
'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg backdrop:bg-black/50 max-w-md w-full"
      aria-labelledby="dialog-title"
    >
      <h2 id="dialog-title" className="text-lg font-semibold mb-4">
        {title}
      </h2>
      {children}
    </dialog>
  );
}
