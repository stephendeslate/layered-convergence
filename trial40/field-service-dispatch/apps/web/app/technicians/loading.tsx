import { Skeleton } from '@/components/ui/skeleton';

export default function TechniciansLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <Skeleton className="h-9 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
