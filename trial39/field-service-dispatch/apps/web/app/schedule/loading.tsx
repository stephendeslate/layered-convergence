// TRACED: FD-UI-LOAD-004 — Schedule loading state
import { Skeleton } from '../../components/ui/skeleton';

export default function ScheduleLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-4 w-64" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}
