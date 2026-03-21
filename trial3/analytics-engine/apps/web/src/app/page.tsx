export default function HomePage() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold">Welcome to Analytics Engine</h2>
      <p className="mb-8 text-gray-600">
        Create dashboards, connect data sources, and embed analytics anywhere.
      </p>
      <div className="grid grid-cols-3 gap-6">
        <DashboardCard title="Dashboards" count={0} href="/dashboards" />
        <DashboardCard title="Data Sources" count={0} href="/data-sources" />
        <DashboardCard title="Active Syncs" count={0} href="/data-sources" />
      </div>
    </div>
  );
}

function DashboardCard({ title, count, href }: { title: string; count: number; href: string }) {
  return (
    <a
      href={href}
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
    >
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold">{count}</p>
    </a>
  );
}
