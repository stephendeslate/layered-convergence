'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { logErrorBoundary } from '../../../lib/error-logging';

export default function DataSourcesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    logErrorBoundary(error, {});
  }, [error]);

  return (
    <div role="alert" className="mx-auto max-w-lg py-12">
      <Alert variant="destructive">
        <AlertTitle>
          <h2 ref={headingRef} tabIndex={-1}>Failed to load data sources</h2>
        </AlertTitle>
        <AlertDescription>
          <p>{error.message}</p>
          <Button onClick={reset} variant="outline" className="mt-4">Try again</Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
