// [TRACED:UI-013] Technicians listing page
export default function TechniciansPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Technicians</h1>
        <button className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)]">
          Add Technician
        </button>
      </div>
      <p className="mt-4 text-sm text-[var(--muted-foreground)]">
        Manage your field service technicians, their skills, and assignments.
      </p>
      <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-8 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">No technicians registered. Add one to get started.</p>
      </div>
    </div>
  );
}
