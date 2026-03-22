// TRACED: FD-UI-SCHED-004 — Schedule loading skeleton with accessibility
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardHeader, CardContent } from '../../components/ui/card';

export default function ScheduleLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading schedule" className="space-y-6">
      <div>
        <Skeleton className="h-9 w-36" />
        <Skeleton className="mt-2 h-4 w-60" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={`stat-skeleton-${String(i)}`}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`sched-skeleton-${String(i)}`} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
      <span className="sr-only">Loading schedule...</span>
    </div>
  );
}
