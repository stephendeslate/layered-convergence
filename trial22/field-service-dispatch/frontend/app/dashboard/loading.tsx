// TRACED:UI-004 loading.tsx with role="status" and aria-busy="true"
export default function DashboardLoading() {
  return (
    <div role="status" aria-busy="true">
      <div className="h-8 bg-[var(--muted)] rounded w-1/4 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-[var(--muted)] rounded animate-pulse" />
        ))}
      </div>
      <div className="h-6 bg-[var(--muted)] rounded w-1/3 mb-4 animate-pulse" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-[var(--muted)] rounded animate-pulse" />
        ))}
      </div>
      <span className="sr-only">Loading dashboard...</span>
    </div>
  );
}
