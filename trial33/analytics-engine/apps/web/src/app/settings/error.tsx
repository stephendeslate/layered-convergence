'use client';

import { useEffect, useRef } from 'react';
import { Button } from '../../../../components/ui/button';

// TRACED: AE-SEC-QUAL-001 — Error boundary with role="alert", useRef, focus
export default function ErrorBoundary({
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
    <div role="alert" className="flex flex-col items-center justify-center gap-4 p-12">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-destructive">
        Something went wrong
      </h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
