import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardsLoading(): React.ReactElement {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
