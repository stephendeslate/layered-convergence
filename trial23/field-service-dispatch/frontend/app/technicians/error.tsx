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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      role="alert"
      ref={ref}
      tabIndex={-1}
      className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
    >
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
