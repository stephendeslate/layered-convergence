// [TRACED:PV-002] Landing page communicates core capabilities: work orders, technician dispatch, route planning
// [TRACED:PV-003] Field service dispatch platform with GPS tracking and invoicing
export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-12 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">
          Field Service Dispatch
        </h1>
        <p className="mt-4 text-lg text-[var(--muted-foreground)]">
          Streamline field operations with intelligent work order management, technician dispatch, and route optimization.
        </p>
      </div>

      <div className="grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--card-foreground)]">
            Work Orders
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Create, assign, and track work orders through their complete lifecycle from creation to completion.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--card-foreground)]">
            Technician Dispatch
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Assign technicians to work orders and routes based on skills, availability, and location.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--card-foreground)]">
            Route Planning
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Plan optimized routes with GPS tracking and real-time location monitoring for field teams.
          </p>
        </div>
      </div>

      <div className="grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--card-foreground)]">
            GPS Tracking
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Real-time GPS event recording for technicians in the field with route-based tracking.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-xl font-semibold text-[var(--card-foreground)]">
            Invoicing
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Generate and manage invoices linked to completed work orders with payment tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
