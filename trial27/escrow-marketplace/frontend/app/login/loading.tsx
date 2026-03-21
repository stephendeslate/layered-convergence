export default function LoginLoading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
      <span className="sr-only">Loading login...</span>
    </div>
  );
}
