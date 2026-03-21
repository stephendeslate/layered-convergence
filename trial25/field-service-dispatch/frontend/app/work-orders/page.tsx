// [TRACED:UI-012] Work orders listing page
export default function WorkOrdersPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Work Orders</h1>
        <button className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]">
          Create Work Order
        </button>
      </div>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        Manage and track work orders through their lifecycle: Created, Assigned, In Progress, Completed, or Cancelled.
      </p>
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">No work orders yet. Create one to get started.</p>
      </div>
    </div>
  );
}
