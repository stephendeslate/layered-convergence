export default function EscrowLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 w-52 animate-pulse rounded bg-muted" />
      <div className="h-4 w-72 animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
      <span className="sr-only">Loading escrow accounts...</span>
    </div>
  );
}
