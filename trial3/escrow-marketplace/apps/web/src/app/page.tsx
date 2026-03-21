export default function HomePage() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-4 gap-6">
        <StatCard label="Total Transactions" value="0" />
        <StatCard label="Held in Escrow" value="$0.00" />
        <StatCard label="Active Disputes" value="0" />
        <StatCard label="Completed Payouts" value="$0.00" />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
