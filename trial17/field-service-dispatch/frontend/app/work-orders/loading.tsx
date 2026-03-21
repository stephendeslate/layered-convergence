export default function WorkOrdersLoading() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Loading work orders">
      <div className="h-8 w-48 bg-slate-200 rounded" />
      <div className="h-10 w-64 bg-slate-200 rounded" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
