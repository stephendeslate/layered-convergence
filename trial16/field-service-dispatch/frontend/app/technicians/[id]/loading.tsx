export default function TechnicianDetailLoading() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="h-4 w-48 bg-muted rounded animate-pulse" />
      <div className="space-y-4 border rounded-lg p-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
