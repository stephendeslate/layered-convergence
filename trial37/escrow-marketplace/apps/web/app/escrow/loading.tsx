import { Skeleton } from '../../components/ui/skeleton';

export default function EscrowLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-6 w-72" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <span className="sr-only">Loading escrow accounts...</span>
    </div>
  );
}
