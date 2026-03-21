// TRACED:UI-001: Every route has loading.tsx with role="status" and aria-busy
export default function RootLoading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
