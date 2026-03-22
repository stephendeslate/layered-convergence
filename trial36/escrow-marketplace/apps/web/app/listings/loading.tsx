export default function ListingsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <span className="sr-only">Loading listings...</span>
    </div>
  );
}
