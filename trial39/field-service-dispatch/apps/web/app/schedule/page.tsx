// TRACED: FD-UI-SCHED-001 — Schedule page with dynamic import for ScheduleStats
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import { formatCoordinates } from '@field-service-dispatch/shared';

const ScheduleStats = dynamic(
  () => import('../../components/schedule-stats').then((mod) => ({ default: mod.ScheduleStats })),
  {
    loading: () => (
      <div role="status" aria-busy="true" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    ),
  },
);

const mockSchedules = [
  {
    id: 'sched-001',
    workOrderTitle: 'Replace rooftop HVAC unit',
    technicianName: 'Maria Garcia',
    scheduledAt: '2026-03-25 09:00',
    location: { lat: '40.7580000', lng: '-73.9855000' },
    status: 'Confirmed',
  },
  {
    id: 'sched-002',
    workOrderTitle: 'Fire suppression inspection',
    technicianName: 'James Chen',
    scheduledAt: '2026-03-25 14:00',
    location: { lat: '40.7484000', lng: '-73.9857000' },
    status: 'Pending',
  },
  {
    id: 'sched-003',
    workOrderTitle: 'Electrical panel upgrade',
    technicianName: 'Sarah Okafor',
    scheduledAt: '2026-03-26 10:00',
    location: { lat: '40.7527000', lng: '-73.9772000' },
    status: 'Confirmed',
  },
];

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Schedule</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Dispatch scheduling and assignment overview.
        </p>
      </div>

      <ScheduleStats totalScheduled={3} pendingAssignment={1} completedToday={5} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
            Upcoming Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Order</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSchedules.map((sched) => (
                <TableRow key={sched.id}>
                  <TableCell>{sched.workOrderTitle}</TableCell>
                  <TableCell>{sched.technicianName}</TableCell>
                  <TableCell className="text-xs">{sched.scheduledAt}</TableCell>
                  <TableCell className="text-xs">
                    {formatCoordinates(sched.location.lat, sched.location.lng)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sched.status === 'Confirmed' ? 'default' : 'outline'}>
                      {sched.status}
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
