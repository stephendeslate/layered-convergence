export default function CreateWorkOrderLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading create work order form">
      <div className="h-8 w-48 bg-slate-200 rounded" />
      <div className="space-y-4 max-w-lg">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-200 rounded" />
        ))}
        <div className="h-10 w-32 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
