// TRACED: EM-FE-003 — Loading states with role="status" aria-busy="true"
export default function HomeLoading() {
  return (
    <div role="status" aria-busy="true" className="flex justify-center py-12">
      <div className="animate-pulse space-y-4 w-full max-w-2xl">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
      <span className="sr-only">Loading home page...</span>
    </div>
  );
}
