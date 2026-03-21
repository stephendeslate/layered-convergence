export default function DashboardPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-4 gap-6">
        <StatCard label="Total Orders" value="0" />
        <StatCard label="In Progress" value="0" />
        <StatCard label="Unassigned" value="0" />
        <StatCard label="Completed Today" value="0" />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
