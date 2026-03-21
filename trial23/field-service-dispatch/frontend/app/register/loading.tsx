export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-[var(--muted-foreground)]">Loading...</div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
