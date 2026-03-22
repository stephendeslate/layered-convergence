import { Skeleton } from '../../../components/ui/skeleton';

export default function DataSourcesLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
