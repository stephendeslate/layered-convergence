import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button>Create Event</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">User Signup Tracking</TableCell>
            <TableCell><Badge>Completed</Badge></TableCell>
            <TableCell>$0.50</TableCell>
            <TableCell>2024-01-15</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Revenue Report</TableCell>
            <TableCell><Badge variant="secondary">Processing</Badge></TableCell>
            <TableCell>$12.75</TableCell>
            <TableCell>2024-01-14</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Failed Import Job</TableCell>
            <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
            <TableCell>$3.20</TableCell>
            <TableCell>2024-01-13</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
