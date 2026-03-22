import { Skeleton } from '@/components/ui/skeleton';

export default function ServiceAreasLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
