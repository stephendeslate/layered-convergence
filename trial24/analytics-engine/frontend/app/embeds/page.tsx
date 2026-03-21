import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function EmbedsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Embeds</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            <TableHead>Dashboard</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-mono text-xs">abc-123-token</TableCell>
            <TableCell>Overview Dashboard</TableCell>
            <TableCell><Badge>Active</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
