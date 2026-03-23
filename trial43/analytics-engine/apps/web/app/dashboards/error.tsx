'use client';

import { useEffect, useRef } from 'react';
import { logClientError } from '@/lib/error-logging';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function DashboardsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logClientError(error, { page: 'dashboards' });
  }, [error]);

  useEffect(() => {
    errorRef.current?.focus();
  }, []);

  return (
    <div ref={errorRef} role="alert" tabIndex={-1} className="space-y-4">
      <Alert variant="destructive">
        <AlertTitle>Error loading dashboards</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
