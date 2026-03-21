// TRACED: FD-UI-LOAD-001 — Work orders loading state
import { Skeleton } from '../../../../components/ui/skeleton';

export default function WorkOrdersLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
