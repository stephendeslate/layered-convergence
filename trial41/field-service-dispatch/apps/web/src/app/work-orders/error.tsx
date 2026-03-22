'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { logErrorToApi } from '../../../lib/error-logging';

export default function WorkOrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    logErrorToApi(error);
    headingRef.current?.focus();
  }, [error]);

  return (
    <div role="alert">
      <Alert variant="destructive">
        <AlertTitle>
          <h2 ref={headingRef} tabIndex={-1}>Work Orders Error</h2>
        </AlertTitle>
        <AlertDescription>
          <p>{error.message || 'Failed to load work orders.'}</p>
          <Button onClick={reset} variant="outline" className="mt-4">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
