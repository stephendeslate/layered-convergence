// TRACED: FD-UI-LOAD-002 — Work orders loading state
import { Skeleton } from '../../components/ui/skeleton';

export default function WorkOrdersLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-64" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
