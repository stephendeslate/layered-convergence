'use client';

export default function DashboardContent() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-[var(--border)] p-4">
        <h3 className="font-semibold">Active Listings</h3>
        <p className="text-2xl font-bold">--</p>
      </div>
      <div className="rounded-lg border border-[var(--border)] p-4">
        <h3 className="font-semibold">Transactions</h3>
        <p className="text-2xl font-bold">--</p>
      </div>
      <div className="rounded-lg border border-[var(--border)] p-4">
        <h3 className="font-semibold">Escrows</h3>
        <p className="text-2xl font-bold">--</p>
      </div>
      <div className="rounded-lg border border-[var(--border)] p-4">
        <h3 className="font-semibold">Disputes</h3>
        <p className="text-2xl font-bold">--</p>
      </div>
    </div>
  );
}
