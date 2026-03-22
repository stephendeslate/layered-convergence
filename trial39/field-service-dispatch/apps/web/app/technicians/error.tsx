// TRACED: FD-UI-ERR-003 — Technicians error boundary with focus management
'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

export default function TechniciansError({
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
        <AlertTitle>Failed to load technicians</AlertTitle>
        <AlertDescription>
          {error.message || 'Unable to retrieve technician data.'}
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex justify-center">
        <Button onClick={reset} variant="outline">
          Retry
        </Button>
      </div>
    </div>
  );
}
