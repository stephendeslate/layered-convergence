export default function DisputeDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border p-6">
          <div className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="rounded-lg border p-6">
          <div className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
