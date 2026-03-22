'use client';

import { ErrorBoundaryContent } from '@/components/error-boundary';

export default function EscrowsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryContent error={error} reset={reset} />;
}
