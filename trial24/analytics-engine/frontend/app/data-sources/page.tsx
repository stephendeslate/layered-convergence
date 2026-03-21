import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function DataSourcesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Data Sources</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Production DB</TableCell>
            <TableCell>PostgreSQL</TableCell>
            <TableCell><Badge>Connected</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
