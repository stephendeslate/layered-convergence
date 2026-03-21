import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function SyncRunsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Sync Runs</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Production DB</TableCell>
            <TableCell><Badge variant="secondary">PENDING</Badge></TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
