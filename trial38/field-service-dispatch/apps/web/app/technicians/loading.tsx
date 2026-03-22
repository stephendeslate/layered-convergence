// TRACED: FD-UI-TECH-002 — Technicians loading skeleton with accessibility
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardHeader, CardContent } from '../../components/ui/card';

export default function TechniciansLoading() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading technicians" className="space-y-6">
      <div>
        <Skeleton className="h-9 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`tech-skeleton-${String(i)}`} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
      <span className="sr-only">Loading technicians...</span>
    </div>
  );
}
