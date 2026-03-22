// TRACED: EM-FE-003 — Loading states with role="status" aria-busy="true"
import { Skeleton } from '../components/ui/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <Skeleton className="h-12 w-64 mx-auto" />
      <Skeleton className="h-6 w-96 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
