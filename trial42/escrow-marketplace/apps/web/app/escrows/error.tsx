// TRACED: EM-WESCE-001
'use client';

import { useEffect, useRef } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { logErrorBoundary } from '@/lib/error-logging';

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
    logErrorBoundary(error);
  }, [error]);

  return (
    <div role="alert">
      <Alert>
        <h2 ref={headingRef} tabIndex={-1}>Failed to load escrows</h2>
        <p>{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </Alert>
    </div>
  );
}
