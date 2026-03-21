export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="h-40 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
