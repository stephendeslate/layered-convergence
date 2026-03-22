export default function TransactionsLoading() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <div className="h-8 rounded w-1/3 animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
        ))}
      </div>
      <span className="sr-only">Loading transactions...</span>
    </div>
  );
}
