export default function DisputesLoading() {
  return (
    <div className="flex flex-col gap-4" role="status">
      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-28 bg-gray-200 rounded animate-pulse" />
      ))}
      <span className="sr-only">Loading disputes...</span>
    </div>
  );
}
