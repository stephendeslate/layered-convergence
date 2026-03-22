'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

export default function PipelinesError({
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
    <div role="alert" ref={errorRef} tabIndex={-1} className="space-y-4">
      <Alert variant="destructive">
        <AlertTitle>Failed to load pipelines</AlertTitle>
        <AlertDescription>
          {error.message || 'An unexpected error occurred while loading pipelines.'}
        </AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
