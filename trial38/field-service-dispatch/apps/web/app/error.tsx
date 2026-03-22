// TRACED: FD-UI-ERR-001 — Root error boundary with focus management and retry
'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

export default function RootError({
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
    <div className="space-y-4">
      <Alert variant="destructive" role="alert">
        <AlertTitle ref={headingRef} tabIndex={-1}>
          Something went wrong
        </AlertTitle>
        <AlertDescription>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </AlertDescription>
      </Alert>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
