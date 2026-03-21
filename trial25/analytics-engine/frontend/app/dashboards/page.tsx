// [TRACED:UI-013] Dashboards page with card grid layout
export default function DashboardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboards</h1>
        <button className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]">
          Create Dashboard
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <p className="text-sm text-[var(--muted-foreground)]">No dashboards created yet</p>
        </div>
      </div>
    </div>
  );
}
