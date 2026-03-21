export default function RegisterLoading() {
  return (
    <div role="status" aria-busy="true" aria-live="polite" className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6">
        <div className="h-8 w-28 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
