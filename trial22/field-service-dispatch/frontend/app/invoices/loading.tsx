export default function InvoicesLoading() {
  return (
    <div role="status" aria-busy="true">
      <div className="h-8 bg-[var(--muted)] rounded w-1/4 mb-6 animate-pulse" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-[var(--muted)] rounded animate-pulse" />
        ))}
      </div>
      <span className="sr-only">Loading invoices...</span>
    </div>
  );
}
