export default function TechnicianDetailLoading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="rounded-lg border p-6 space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted" />
        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
