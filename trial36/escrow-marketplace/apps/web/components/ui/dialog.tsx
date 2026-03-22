'use client';

import { forwardRef, type HTMLAttributes, useEffect, useRef } from 'react';
import { cn } from './utils';

export interface DialogProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  onClose?: () => void;
}

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  ({ className, open = false, onClose, children, ...props }, ref) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && onClose) {
          onClose();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [open, onClose]);

    if (!open) return null;

    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={(e) => {
          if (e.target === overlayRef.current && onClose) onClose();
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          ref={ref}
          className={cn(
            'bg-white rounded-lg shadow-lg p-6 w-full max-w-md',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);

Dialog.displayName = 'Dialog';

export { Dialog };
