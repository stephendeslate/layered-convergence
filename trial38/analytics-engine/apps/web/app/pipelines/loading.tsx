import { Skeleton } from '../../components/ui/skeleton';

export default function PipelinesLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-5 w-64" />
      </div>
      <Skeleton className="h-64" />
      <span className="sr-only">Loading pipelines...</span>
    </div>
  );
}
