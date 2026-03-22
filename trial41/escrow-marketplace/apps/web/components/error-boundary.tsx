// TRACED:EM-MON-12 frontend error boundary with structured logging
'use client';

import { useRef, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundaryContent({ error, reset }: ErrorBoundaryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();

    // Structured error logging to console (will be sent to API in production)
    console.error(JSON.stringify({
      level: 'error',
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      component: 'ErrorBoundary',
    }));
  }, [error]);

  return (
    <div role="alert" className="flex min-h-[400px] items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTitle>
          <h2 ref={headingRef} tabIndex={-1}>Something went wrong</h2>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p>{error.message || 'An unexpected error occurred.'}</p>
          <Button onClick={reset} variant="outline" className="mt-4">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
