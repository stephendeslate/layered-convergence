export default function WorkOrderDetailLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      <div className="space-y-4 border rounded-lg p-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="h-20 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="space-y-4 border rounded-lg p-6">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-9 w-24 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
