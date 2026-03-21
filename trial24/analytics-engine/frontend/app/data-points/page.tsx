import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function DataPointsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Points</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Label</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Temperature</TableCell>
            <TableCell className="font-mono">42.123456</TableCell>
            <TableCell>Sensor API</TableCell>
            <TableCell>2026-03-21 10:00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
