export default function WorkOrderDetailLoading() {
  return (
    <div role="status" aria-busy="true">
      <div className="h-8 bg-[var(--muted)] rounded w-1/2 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-[var(--muted)] rounded animate-pulse" />
        <div className="h-64 bg-[var(--muted)] rounded animate-pulse" />
      </div>
      <span className="sr-only">Loading work order details...</span>
    </div>
  );
}
