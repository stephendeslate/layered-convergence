// [TRACED:UI-014] Routes listing page
export default function RoutesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Routes</h1>
        <button className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]">
          Plan Route
        </button>
      </div>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        Plan and track routes for technicians with GPS event monitoring.
      </p>
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">No routes planned. Create one to get started.</p>
      </div>
    </div>
  );
}
