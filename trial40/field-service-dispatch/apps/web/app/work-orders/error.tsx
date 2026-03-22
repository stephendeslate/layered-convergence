'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatLogEntry } from '@field-service-dispatch/shared';

export default function WorkOrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const entry = formatLogEntry('error', 'Work orders error boundary triggered', {
      errorMessage: error.message,
      digest: error.digest,
    });
    process.stderr.write?.(entry + '\n');
  }, [error]);

  useEffect(() => {
    alertRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto max-w-lg py-12" role="alert" ref={alertRef} tabIndex={-1}>
      <Alert variant="destructive">
        <AlertTitle>Failed to load work orders</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
      <Button onClick={reset} className="mt-4">Try again</Button>
    </div>
  );
}
