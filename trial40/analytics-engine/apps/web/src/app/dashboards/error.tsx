'use client';

import { useEffect, useRef } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { formatLogEntry } from '@analytics-engine/shared';

export default function DashboardsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    const logEntry = formatLogEntry('error', 'Dashboards page error', {
      message: error.message,
      digest: error.digest,
      component: 'DashboardsError',
    });
    process.stderr.write(logEntry + '\n');
  }, [error]);

  return (
    <div role="alert" className="space-y-4">
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">
        Something went wrong
      </h2>
      <Alert variant="destructive">
        <AlertTitle>Error loading dashboards</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
