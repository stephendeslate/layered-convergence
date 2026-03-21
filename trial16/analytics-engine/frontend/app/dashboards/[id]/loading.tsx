export default function DashboardDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`widget-loading-${i}`}
            className="h-48 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
