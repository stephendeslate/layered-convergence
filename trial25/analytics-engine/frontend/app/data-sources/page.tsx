// [TRACED:UI-011] Data Sources page with table layout
export default function DataSourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Data Sources</h1>
        <button className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]">
          Add Data Source
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-[var(--border)]">
        <table className="w-full">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">Last Synced</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border)]">
              <td className="px-4 py-3 text-sm" colSpan={4}>
                No data sources configured yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
