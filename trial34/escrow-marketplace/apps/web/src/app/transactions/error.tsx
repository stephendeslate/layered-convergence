'use client';

import { useEffect, useRef } from 'react';
import { Button } from '../../../../components/ui/button';
import { Alert, AlertDescription } from '../../../../components/ui/alert';

// TRACED: EM-AX-ERROR-002 — Transactions error with role="alert" + useRef + focus
export default function TransactionsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);

  return (
    <div role="alert" className="container mx-auto px-6 py-8">
      <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold mb-4">Transactions Error</h2>
      <Alert variant="destructive" className="mb-4"><AlertDescription>{error.message}</AlertDescription></Alert>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
