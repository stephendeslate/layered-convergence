'use client';

// TRACED: EM-FE-004 — Error states with role="alert" and focus management
import { useEffect, useRef } from 'react';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';

export default function Error({
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
    <div className="max-w-md mx-auto mt-12">
      <Alert variant="destructive" ref={alertRef} tabIndex={-1}>
        <h2 className="font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm mb-4">{error.message}</p>
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
      </Alert>
    </div>
  );
}
