export default function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="space-y-4 text-center">
        <div
          className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}
