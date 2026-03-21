export default function DisputeDetailLoading() {
  return (
    <div className="flex flex-col gap-4" role="status">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="h-40 bg-gray-200 rounded animate-pulse" />
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
      <span className="sr-only">Loading dispute details...</span>
    </div>
  );
}
