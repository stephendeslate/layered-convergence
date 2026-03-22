// TRACED: EM-FE-007 — Loading state with role="status" and aria-busy

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
