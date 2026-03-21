export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[40vh] items-center justify-center">
      <p className="text-[var(--muted-foreground)]">Loading...</p>
    </div>
  );
}
