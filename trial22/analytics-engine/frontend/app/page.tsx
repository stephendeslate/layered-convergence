// [TRACED:UI-005] Home page with platform overview

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        Analytics Engine
      </h1>
      <p className="text-muted-foreground">
        Multi-tenant analytics platform. Connect data sources, build pipelines,
        and create dashboards to visualize your data.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Data Sources</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Connect and manage your data integrations.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Pipelines</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure data processing workflows.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Dashboards</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Build and share interactive dashboards.
          </p>
        </div>
      </div>
    </div>
  );
}
