import { Skeleton } from '../../../../components/ui/skeleton';

// TRACED: AE-AX-LOADING-001 — loading.tsx with role="status" + aria-busy
export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true" className="container mx-auto px-6 py-8">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
      <span className="sr-only">Loading dashboards...</span>
    </div>
  );
}
