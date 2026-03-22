'use client';

import { useEffect, useRef } from 'react';

// TRACED: EM-FE-008 — Error boundary with role="alert" and useRef focus

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
    <div role="alert" className="mx-auto max-w-lg py-20 text-center">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-destructive outline-none"
      >
        Something went wrong
      </h2>
      <p className="mt-4 text-muted-foreground">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
