'use client';

import { useEffect, useRef } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function PipelinesError({
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
    <div role="alert">
      <h2
        ref={headingRef}
        tabIndex={-1}
        style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}
      >
        Failed to load pipelines
      </h2>
      <Alert>
        <p>{error.message}</p>
      </Alert>
      <div style={{ marginTop: '1rem' }}>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
