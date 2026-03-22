// TRACED: FD-UI-ERR-001 — Root error boundary with role="alert" and focus management
'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    alertRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto max-w-lg py-12">
      <Alert variant="destructive" role="alert" ref={alertRef} tabIndex={-1}>
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex justify-center">
        <Button onClick={reset} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );
}
