export default function CreateWorkOrderLoading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="space-y-4 max-w-2xl">
      <div className="h-8 w-44 animate-pulse rounded bg-muted" />
      <div className="rounded-lg border p-6 space-y-4">
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-20 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
