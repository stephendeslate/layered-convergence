export default function WorkOrderDetailLoading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded bg-muted" />
      <div className="rounded-lg border p-6 space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
