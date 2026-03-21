export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-label="Loading dashboard">
      <div className="h-8 w-48 bg-slate-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-slate-200 rounded-lg" />
    </div>
  );
}
