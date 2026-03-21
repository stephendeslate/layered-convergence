export default function PayoutsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-28 animate-pulse rounded bg-muted" />
        <div className="h-10 w-36 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  );
}
