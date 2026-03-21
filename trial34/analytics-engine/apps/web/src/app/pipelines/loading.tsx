import { Skeleton } from '../../../../components/ui/skeleton';

// TRACED: AE-AX-LOADING-002 — Pipelines loading with role="status" + aria-busy
export default function PipelinesLoading() {
  return (
    <div role="status" aria-busy="true" className="container mx-auto px-6 py-8">
      <Skeleton className="h-10 w-48 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      <span className="sr-only">Loading pipelines...</span>
    </div>
  );
}
