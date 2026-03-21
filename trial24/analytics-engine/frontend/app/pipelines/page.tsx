import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pipelines</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>ETL Pipeline</TableCell>
            <TableCell><Badge variant="secondary">DRAFT</Badge></TableCell>
            <TableCell>2026-03-21</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
