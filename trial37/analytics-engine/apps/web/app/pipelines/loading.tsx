import { Skeleton } from '../../components/ui/skeleton';

export default function PipelinesLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-1 h-4 w-72" />
      </div>
      <Skeleton className="h-64" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
