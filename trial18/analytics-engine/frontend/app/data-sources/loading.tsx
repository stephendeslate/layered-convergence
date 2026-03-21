export default function DataSourcesLoading() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading data sources">
      <div className="h-8 w-40 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    </div>
  );
}
