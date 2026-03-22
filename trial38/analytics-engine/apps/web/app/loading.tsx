import { Skeleton } from '../components/ui/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-8">
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
