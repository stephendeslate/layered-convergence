'use client';

import { Button } from '@/components/ui/button';

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="p-6">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset} variant="default">
        Try again
      </Button>
    </div>
  );
}
