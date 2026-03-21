export default function TransactionsLoading() {
  return (
    <div className="flex flex-col gap-4" role="status">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
      ))}
      <span className="sr-only">Loading transactions...</span>
    </div>
  );
}
