// TRACED: FD-UI-WO-004 — Work orders error boundary with focus management
'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

export default function WorkOrdersError({
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
          Failed to load work orders
        </AlertTitle>
        <AlertDescription>
          {error.message || 'An unexpected error occurred while loading work orders.'}
        </AlertDescription>
      </Alert>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
