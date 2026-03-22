// TRACED: EM-FE-004 — Root error boundary with focus management
'use client';

import { useEffect, useRef } from 'react';

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
    // Log error to API for monitoring
    const errorPayload = {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      component: 'RootErrorBoundary',
    };
    process.stderr.write?.(JSON.stringify(errorPayload));
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-[200px] p-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold mb-4" style={{ color: 'var(--destructive)' }}>
        Something went wrong
      </h2>
      <p className="mb-4" style={{ color: 'var(--muted-foreground)' }}>
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded font-medium"
        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        Try again
      </button>
    </div>
  );
}
