export default function DashboardsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`db-loading-${i}`}
            className="h-40 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
