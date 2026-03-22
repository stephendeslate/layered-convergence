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
    <div ref={errorRef} role="alert" tabIndex={-1} className="space-y-4">
      <Alert variant="destructive">
        <AlertTitle>Failed to load pipelines</AlertTitle>
        <AlertDescription>
          {error.message || 'Could not load pipelines.'}
        </AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
