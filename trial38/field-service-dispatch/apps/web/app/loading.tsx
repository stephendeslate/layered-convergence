// TRACED: FD-UI-LOAD-001 — Root loading skeleton with accessibility attributes
import { Skeleton } from '../components/ui/skeleton';

export default function RootLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading page" className="space-y-8">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={`root-skeleton-${String(i)}`} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
