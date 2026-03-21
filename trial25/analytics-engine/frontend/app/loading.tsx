// [TRACED:UI-006] Root loading.tsx with role="status" and aria-busy="true"
export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--muted)] border-t-[var(--primary)]" />
        <p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
        <span className="sr-only">Loading content, please wait</span>
      </div>
    </div>
  );
}
