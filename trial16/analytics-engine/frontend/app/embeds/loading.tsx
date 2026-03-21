export default function EmbedsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={`embed-loading-${i}`}
            className="h-48 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
