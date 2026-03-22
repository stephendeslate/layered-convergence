'use client';

import { useEffect, useRef } from 'react';

export default function EscrowError({
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
    <div role="alert" className="py-12 text-center">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-xl font-bold text-destructive outline-none"
      >
        Failed to load escrow accounts
      </h2>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
