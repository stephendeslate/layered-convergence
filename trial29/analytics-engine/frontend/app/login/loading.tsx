export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
