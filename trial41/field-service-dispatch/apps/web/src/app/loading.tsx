import { Skeleton } from '../../components/ui/skeleton';

// TRACED: FD-ROOT-LOADING
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-4 w-96 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}
