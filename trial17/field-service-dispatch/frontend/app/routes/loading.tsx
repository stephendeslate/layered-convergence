export default function RoutesLoading() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Loading routes">
      <div className="h-8 w-48 bg-slate-200 rounded" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
