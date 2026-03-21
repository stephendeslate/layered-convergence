// [TRACED:FD-012] Loading state with role="status" and aria-busy="true"
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)]" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
