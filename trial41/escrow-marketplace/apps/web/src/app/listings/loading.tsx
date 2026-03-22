import { Skeleton } from '@/components/ui/skeleton';

export default function ListingsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
      <span className="sr-only">Loading listings...</span>
    </div>
  );
}
