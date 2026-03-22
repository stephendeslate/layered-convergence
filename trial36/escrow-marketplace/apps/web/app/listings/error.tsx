'use client';

import { useEffect, useRef } from 'react';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';

export default function ListingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alertRef.current) {
      alertRef.current.focus();
    }
  }, []);

  return (
    <div
      role="alert"
      ref={alertRef}
      tabIndex={-1}
      className="flex flex-col items-center py-12 space-y-4"
    >
      <Alert variant="destructive">
        <h2 className="font-semibold">Failed to load listings</h2>
        <p className="text-sm">{error.message}</p>
      </Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
