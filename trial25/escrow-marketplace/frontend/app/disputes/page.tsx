// [TRACED:UI-012] Disputes page with card layout
export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Disputes</h1>
        <button className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]">File Dispute</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">No disputes filed</p>
        </div>
      </div>
    </div>
  );
}
