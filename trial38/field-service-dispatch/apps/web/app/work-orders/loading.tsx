// TRACED: FD-UI-WO-003 — Work orders loading skeleton with accessibility
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardHeader, CardContent } from '../../components/ui/card';

export default function WorkOrdersLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading work orders" className="space-y-6">
      <div>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`wo-skeleton-${String(i)}`} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
      <span className="sr-only">Loading work orders...</span>
    </div>
  );
}
