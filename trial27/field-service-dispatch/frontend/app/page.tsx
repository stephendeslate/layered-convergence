export default function HomePage() {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-3xl font-bold text-[var(--foreground)]">
          Field Service Dispatch
        </h1>
        <p className="mb-6 text-[var(--muted-foreground)]">
          Manage work orders, dispatch technicians, optimize routes,
          and track field operations in real time.
        </p>
        <div className="flex gap-4">
          <a
            href="/register"
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-[var(--primary-foreground)] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-md border border-[var(--border)] px-4 py-2 text-[var(--foreground)] hover:bg-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
          >
            Sign In
          </a>
        </div>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
        <h2 className="mb-3 text-xl font-semibold text-[var(--card-foreground)]">
          Platform Features
        </h2>
        <ul className="space-y-2 text-[var(--muted-foreground)]">
          <li>Work order creation and lifecycle management</li>
          <li>Technician assignment and skill matching</li>
          <li>Route optimization for daily schedules</li>
          <li>Real-time GPS tracking of field technicians</li>
          <li>Automated invoice generation</li>
          <li>Multi-company tenant isolation</li>
        </ul>
      </div>
    </div>
  );
}
