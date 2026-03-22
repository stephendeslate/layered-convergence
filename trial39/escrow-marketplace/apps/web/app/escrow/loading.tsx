import { Skeleton } from '@/components/ui/skeleton';

export default function EscrowLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading escrow accounts...</span>
      <div className="animate-pulse h-8 w-52 rounded bg-[var(--muted)]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[var(--border)] p-6 space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
