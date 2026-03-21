'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function DisputesError({
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
    <div role="alert" className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-[var(--destructive)]">
        Disputes Error
      </h2>
      <p className="text-[var(--muted-foreground)]">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
