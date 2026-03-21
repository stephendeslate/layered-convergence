// [TRACED:PV-001] Landing page for Analytics Engine
// [TRACED:PV-002] Three core capabilities: data sources, pipelines, dashboards
// [TRACED:PV-003] Multi-tenant analytics platform
export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">Analytics Engine</h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          Multi-tenant analytics platform with real-time pipelines and interactive dashboards
        </p>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Data Sources</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Connect PostgreSQL, MySQL, REST APIs, CSV files, and S3 buckets
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Pipelines</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Build ETL pipelines with state management and sync run tracking
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Dashboards</h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Create interactive dashboards with widgets, charts, and embeddable views
          </p>
        </div>
      </section>
    </div>
  );
}
