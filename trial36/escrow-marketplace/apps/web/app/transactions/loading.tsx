export default function TransactionsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-56 animate-pulse" />
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      <span className="sr-only">Loading transactions...</span>
    </div>
  );
}
