import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
