export default function DataSourceDetailLoading() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading data source details">
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />
      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
      <div className="h-64 bg-muted animate-pulse rounded-xl" />
    </div>
  );
}
