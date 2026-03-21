export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-[40vh]">
      <p className="text-[var(--muted-foreground)]">Loading...</p>
    </div>
  );
}
