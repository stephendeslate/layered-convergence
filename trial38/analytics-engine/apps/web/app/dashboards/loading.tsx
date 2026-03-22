import { Skeleton } from '../../components/ui/skeleton';

export default function DashboardsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-5 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <span className="sr-only">Loading dashboards...</span>
    </div>
  );
}
