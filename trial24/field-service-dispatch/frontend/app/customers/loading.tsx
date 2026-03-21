export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--muted)] border-t-[var(--foreground)]" />
        <p className="text-sm text-[var(--muted-foreground)]">Loading Customers...</p>
      </div>
    </div>
  );
}
