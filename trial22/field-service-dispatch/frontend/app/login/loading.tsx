export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md p-6 bg-[var(--card)] border border-[var(--border)] rounded-lg animate-pulse">
        <div className="h-8 bg-[var(--muted)] rounded w-1/3 mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-[var(--muted)] rounded" />
          <div className="h-10 bg-[var(--muted)] rounded" />
          <div className="h-10 bg-[var(--muted)] rounded" />
        </div>
      </div>
      <span className="sr-only">Loading login page...</span>
    </div>
  );
}
