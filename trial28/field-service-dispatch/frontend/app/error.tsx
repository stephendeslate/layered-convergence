'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

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
    <div role="alert" className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mb-4 text-2xl font-bold text-[var(--destructive)] outline-none"
        >
          Something went wrong
        </h2>
        <p className="mb-6 text-[var(--muted-foreground)]">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
