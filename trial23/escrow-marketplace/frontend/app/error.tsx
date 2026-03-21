'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// TRACED:UI-002: Every route has error.tsx with role="alert" and useRef focus
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    errorRef.current?.focus();
  }, []);

  return (
    <div
      role="alert"
      ref={errorRef}
      tabIndex={-1}
      className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
    >
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
