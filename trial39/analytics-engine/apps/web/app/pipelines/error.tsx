'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function PipelinesError({
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
    <div role="alert" className="mx-auto max-w-xl py-12">
      <Alert variant="destructive">
        <AlertTitle>
          <h2 ref={headingRef} tabIndex={-1} className="outline-none">
            Failed to load pipelines
          </h2>
        </AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || 'Could not fetch pipeline data. Please try again.'}
        </AlertDescription>
      </Alert>
      <Button onClick={reset} className="mt-4">
        Retry
      </Button>
    </div>
  );
}
