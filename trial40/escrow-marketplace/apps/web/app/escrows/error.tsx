'use client';

import { useEffect, useRef } from 'react';

export default function EscrowsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [error]);

  return (
    <div role="alert" className="p-4 rounded-lg border" style={{ borderColor: 'var(--destructive)' }}>
      <h2 ref={headingRef} tabIndex={-1} className="font-bold mb-2" style={{ color: 'var(--destructive)' }}>
        Failed to load escrow accounts
      </h2>
      <p className="mb-4" style={{ color: 'var(--muted-foreground)' }}>{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded"
        style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
      >
        Retry
      </button>
    </div>
  );
}
