import { Skeleton } from '../../components/ui/skeleton';

export default function ReportsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-2 h-5 w-56" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <span className="sr-only">Loading reports...</span>
    </div>
  );
}
