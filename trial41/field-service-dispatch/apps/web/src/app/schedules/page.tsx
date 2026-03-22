import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function SchedulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedules</h1>
        <Button>Create Schedule</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Technician</TableHead>
            <TableHead>Work Order</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Smith</TableCell>
            <TableCell>Fix broken AC unit</TableCell>
            <TableCell>2026-03-21 09:00</TableCell>
            <TableCell>2026-03-21 11:00</TableCell>
            <TableCell><Badge variant="secondary">Scheduled</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
