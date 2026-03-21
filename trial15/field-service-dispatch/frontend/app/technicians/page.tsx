import { Suspense } from "react";
import { getTechnicians } from "@/lib/api";
import { TechnicianCard } from "@/components/technicians/technician-card";

function TechnicianListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border bg-card p-6"
        >
          <div className="mb-3 flex justify-between">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-5 w-20 rounded bg-muted" />
          </div>
          <div className="mb-3 flex gap-2">
            <div className="h-5 w-16 rounded bg-muted" />
            <div className="h-5 w-16 rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function TechnicianList() {
  const technicians = await getTechnicians();

  if (technicians.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No technicians found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {technicians.map((technician) => (
        <TechnicianCard key={technician.id} technician={technician} />
      ))}
    </div>
  );
}

export default function TechniciansPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Technicians</h1>
      <Suspense fallback={<TechnicianListSkeleton />}>
        <TechnicianList />
      </Suspense>
    </div>
  );
}
