// TRACED: EM-FE-003 — Root loading state with accessibility
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-[200px]">
      <div className="animate-pulse space-y-4 w-full max-w-md">
        <div className="h-8 rounded w-3/4" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="h-4 rounded w-5/6" style={{ backgroundColor: 'var(--muted)' }} />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
