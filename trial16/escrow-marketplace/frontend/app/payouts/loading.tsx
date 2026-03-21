export default function PayoutsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-32 animate-pulse rounded bg-gray-200" />
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-full animate-pulse rounded bg-gray-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
