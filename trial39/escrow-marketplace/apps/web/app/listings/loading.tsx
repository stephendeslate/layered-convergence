import { Skeleton } from '@/components/ui/skeleton';

export default function ListingsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading listings...</span>
      <div className="animate-pulse h-8 w-48 rounded bg-[var(--muted)]" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[var(--border)] p-6 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
