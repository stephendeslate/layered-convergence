// [TRACED:UI-013] Payouts page with table layout
export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Payouts</h1>
      </div>
      <div className="overflow-hidden rounded-lg border border-[var(--border)]">
        <table className="w-full">
          <thead className="bg-[var(--muted)]">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">Processed</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border)]">
              <td className="px-4 py-3 text-sm" colSpan={4}>No payouts yet</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
