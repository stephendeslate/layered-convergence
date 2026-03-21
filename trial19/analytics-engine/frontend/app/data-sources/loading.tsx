export default function DataSourcesLoading() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading data sources">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
