// TRACED: FD-SCHED-001 — Schedules list page with dynamic stats component
import dynamic from 'next/dynamic';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const ScheduleStats = dynamic(() => import('@/components/schedule-stats').then(m => ({ default: m.ScheduleStats })), {
  ssr: false,
  loading: () => <div className="grid gap-4 sm:grid-cols-3"><div className="h-24 animate-pulse rounded-lg bg-[var(--muted)]" /><div className="h-24 animate-pulse rounded-lg bg-[var(--muted)]" /><div className="h-24 animate-pulse rounded-lg bg-[var(--muted)]" /></div>,
});

interface Schedule {
  id: string;
  workOrderId: string;
  technicianId: string;
  scheduledAt: string;
}

export default function SchedulesPage() {
  const schedules: Schedule[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedules</h1>
        <p className="text-[var(--muted-foreground)]">
          View and manage technician schedules.
        </p>
      </div>

      <ScheduleStats totalSchedules={0} todaySchedules={0} upcomingSchedules={0} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Work Order</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Scheduled At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-[var(--muted-foreground)]">
                No schedules found. Connect to the API to load data.
              </TableCell>
            </TableRow>
          ) : (
            schedules.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-sm">{s.id}</TableCell>
                <TableCell>{s.workOrderId}</TableCell>
                <TableCell>{s.technicianId}</TableCell>
                <TableCell>{new Date(s.scheduledAt).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
