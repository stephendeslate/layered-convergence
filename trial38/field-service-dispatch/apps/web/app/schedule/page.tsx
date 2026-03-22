// TRACED: FD-UI-SCHED-001 — Schedule page with table and date formatting
// TRACED: FD-UI-SCHED-002 — Schedule dynamic import for bundle optimization (L7)
import dynamic from 'next/dynamic';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';

const ScheduleStats = dynamic(
  () => import('../../components/schedule-stats'),
  {
    loading: () => <Skeleton className="h-24 w-full" />,
  },
);

const mockSchedules = [
  {
    id: 'sched-001',
    workOrderTitle: 'Replace rooftop HVAC unit',
    workOrderId: 'wo-001',
    technicianName: 'Maria Garcia',
    scheduledAt: '2026-03-22T09:00:00Z',
    status: 'Upcoming',
  },
  {
    id: 'sched-002',
    workOrderTitle: 'Fire suppression inspection',
    workOrderId: 'wo-002',
    technicianName: 'James Chen',
    scheduledAt: '2026-03-21T14:00:00Z',
    status: 'Today',
  },
  {
    id: 'sched-003',
    workOrderTitle: 'Electrical panel upgrade',
    workOrderId: 'wo-003',
    technicianName: 'Sarah Okafor',
    scheduledAt: '2026-03-20T10:30:00Z',
    status: 'Completed',
  },
  {
    id: 'sched-004',
    workOrderTitle: 'Emergency plumbing repair',
    workOrderId: 'wo-004',
    technicianName: 'James Chen',
    scheduledAt: '2026-03-19T08:00:00Z',
    status: 'Missed',
  },
];

function formatScheduleDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const scheduleStatusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Upcoming: 'outline',
  Today: 'default',
  Completed: 'secondary',
  Missed: 'destructive',
};

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Schedule</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            View upcoming and past technician dispatch schedules.
          </p>
        </div>
        <Badge variant="secondary">{mockSchedules.length} entries</Badge>
      </div>

      <ScheduleStats
        upcoming={mockSchedules.filter((s) => s.status === 'Upcoming').length}
        today={mockSchedules.filter((s) => s.status === 'Today').length}
        completed={mockSchedules.filter((s) => s.status === 'Completed').length}
        missed={mockSchedules.filter((s) => s.status === 'Missed').length}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
            All Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{schedule.workOrderTitle}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">
                        {schedule.workOrderId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{schedule.technicianName}</TableCell>
                  <TableCell className="text-sm">
                    {formatScheduleDate(schedule.scheduledAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={scheduleStatusVariant[schedule.status] ?? 'outline'}>
                      {schedule.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
