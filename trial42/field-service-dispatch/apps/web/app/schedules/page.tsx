import dynamic from 'next/dynamic';
import { fetchSchedules } from '../actions';
import { Badge } from '@/components/ui/badge';

const Table = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.Table),
);
const TableHeader = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableHeader),
);
const TableBody = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableBody),
);
const TableRow = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableRow),
);
const TableHead = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableHead),
);
const TableCell = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableCell),
);

interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  technician?: { name: string };
  workOrder?: { title: string };
}

export default async function SchedulesPage() {
  let schedules: { data: Schedule[] } = { data: [] };
  try {
    schedules = await fetchSchedules();
  } catch {
    // Will show empty state
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Schedules</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Work Order</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.data.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell>
                {new Date(schedule.startTime).toLocaleString()}
              </TableCell>
              <TableCell>
                {new Date(schedule.endTime).toLocaleString()}
              </TableCell>
              <TableCell>
                <Badge>{schedule.status}</Badge>
              </TableCell>
              <TableCell>{schedule.technician?.name ?? '-'}</TableCell>
              <TableCell>{schedule.workOrder?.title ?? '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
