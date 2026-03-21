export default function InvoicesLoading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-4">
      <div className="h-8 w-28 animate-pulse rounded bg-muted" />
      <div className="rounded-lg border">
        <div className="h-12 w-full animate-pulse rounded-t bg-muted" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse border-t bg-muted/50" />
        ))}
      </div>
    </div>
  );
}
