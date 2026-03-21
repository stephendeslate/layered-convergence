export default function TechniciansLoading() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Loading technicians">
      <div className="h-8 w-48 bg-slate-200 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-slate-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
