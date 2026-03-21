export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)]" />
        <span className="sr-only">Loading login page...</span>
      </div>
    </div>
  );
}
