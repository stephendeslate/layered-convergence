import { Skeleton } from '../../../components/ui/skeleton';

// TRACED: FD-DASHBOARD-LOADING
export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    </div>
  );
}
