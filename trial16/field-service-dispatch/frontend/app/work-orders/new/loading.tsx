export default function CreateWorkOrderLoading() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <div className="space-y-4 border rounded-lg p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
