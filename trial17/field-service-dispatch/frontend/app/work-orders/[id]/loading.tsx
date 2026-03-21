export default function WorkOrderDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading work order details">
      <div className="h-8 w-64 bg-slate-200 rounded" />
      <div className="h-48 bg-slate-200 rounded-lg" />
      <div className="h-12 w-96 bg-slate-200 rounded" />
    </div>
  );
}
