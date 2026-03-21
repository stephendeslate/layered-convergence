export default function DashboardDetailLoading() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading dashboard details">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="h-4 w-96 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
