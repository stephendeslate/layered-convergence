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
    alertRef.current?.focus();
  }, []);

  return (
    <div role="alert" className="max-w-md mx-auto mt-12">
      <Alert variant="destructive" ref={alertRef} tabIndex={-1}>
        <h2 className="font-semibold mb-2">Failed to load listings</h2>
        <p className="text-sm mb-4">{error.message}</p>
        <Button variant="outline" onClick={reset}>
          Retry
        </Button>
      </Alert>
    </div>
  );
}
