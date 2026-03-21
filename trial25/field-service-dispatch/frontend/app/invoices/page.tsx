// [TRACED:UI-015] Invoices listing page
export default function InvoicesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Invoices</h1>
        <button className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]">
          Create Invoice
        </button>
      </div>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        Manage invoices linked to completed work orders. Track payment status from Draft to Paid.
      </p>
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">No invoices created. Generate one from a completed work order.</p>
      </div>
    </div>
  );
}
