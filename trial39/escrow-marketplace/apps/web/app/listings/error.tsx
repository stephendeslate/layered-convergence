'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function ListingsError({
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
    <div role="alert" className="flex flex-col items-center justify-center gap-4 p-8">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-[var(--destructive)] outline-none"
      >
        Failed to load listings
      </h2>
      <p className="text-[var(--muted-foreground)]">
        {error.message || 'Could not retrieve listings'}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
