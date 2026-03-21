'use client';

import { useEffect, useRef } from 'react';

// [TRACED:UI-007] Route error.tsx with role="alert", useRef+useEffect focus management
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold text-[var(--destructive)] outline-none"
        >
          Something went wrong
        </h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
