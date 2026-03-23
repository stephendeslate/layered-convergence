'use client';

import { useEffect, useRef } from 'react';
import { logClientError } from '@/lib/error-logging';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logClientError(error, { page: 'login' });
  }, [error]);

  useEffect(() => {
    errorRef.current?.focus();
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div ref={errorRef} role="alert" tabIndex={-1} className="space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
