// TRACED: EM-FE-005 — Root loading state with accessibility
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4 p-8">
      <span className="sr-only">Loading page content...</span>
      <div className="animate-pulse h-8 w-64 rounded bg-[var(--muted)]" />
      <div className="animate-pulse h-4 w-96 rounded bg-[var(--muted)]" />
      <div className="animate-pulse h-48 rounded-lg bg-[var(--muted)]" />
    </div>
  );
}
