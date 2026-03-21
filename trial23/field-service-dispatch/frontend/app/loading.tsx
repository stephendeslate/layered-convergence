// TRACED:ROOT_LOADING — Root loading.tsx exists at app/loading.tsx
// TRACED:LOADING_ARIA — Loading states have role="status" and aria-busy="true"
// TRACED:SR_ONLY_LOADING — Loading states include sr-only text

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-[var(--muted-foreground)]">Loading...</div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
