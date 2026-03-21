export default function Loading() {
  return (
    <div className="flex items-center justify-center py-16" role="status">
      <div className="animate-pulse flex flex-col gap-4 w-full max-w-2xl">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
      <span className="sr-only">Loading dashboard...</span>
    </div>
  );
}
