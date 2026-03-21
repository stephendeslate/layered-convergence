"use client";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[var(--foreground)]">
        Work Orders
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Title
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Technician
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--muted-foreground)]">
                Customer
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-[var(--muted-foreground)]"
              >
                Sign in to view work orders
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
