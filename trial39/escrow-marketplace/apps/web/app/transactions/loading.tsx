import { Skeleton } from '@/components/ui/skeleton';

export default function TransactionsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading transactions...</span>
      <div className="animate-pulse h-8 w-56 rounded bg-[var(--muted)]" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}
