// TRACED: FD-UI-ERR-001 — Work orders error boundary
'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../../../../components/ui/alert';
import { Button } from '../../../../components/ui/button';

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
    <div role="alert" className="space-y-4">
      <Alert variant="destructive">
        <AlertTitle ref={headingRef} tabIndex={-1}>
          Failed to load work orders
        </AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
