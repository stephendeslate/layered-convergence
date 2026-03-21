export default function DataSourceDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-lg border bg-muted" />
        <div className="h-48 animate-pulse rounded-lg border bg-muted" />
      </div>
    </div>
  );
}
