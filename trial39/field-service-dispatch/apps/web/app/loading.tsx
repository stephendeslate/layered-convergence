// TRACED: FD-UI-LOAD-001 — Root loading state with role="status" and aria-busy
import { Skeleton } from '../components/ui/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}
