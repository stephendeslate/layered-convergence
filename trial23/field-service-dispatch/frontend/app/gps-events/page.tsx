import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function GpsEventsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">GPS Events</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Technician</TableHead>
            <TableHead>Latitude</TableHead>
            <TableHead>Longitude</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John Doe</TableCell>
            <TableCell>40.7128</TableCell>
            <TableCell>-74.0060</TableCell>
            <TableCell>2026-03-21 10:30:00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
