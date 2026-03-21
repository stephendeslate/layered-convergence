import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../../components/ui/table';
import { formatDate, WORK_ORDER_STATUSES } from '@field-service-dispatch/shared';

// TRACED: FD-DM-WO-001 — Dispatch board using shared formatDate + constants
export default function DispatchPage() {
  const now = formatDate(new Date(), 'long');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispatch Board</h1>
        <p className="text-sm text-muted-foreground">As of: {now}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Fix leaking pipe</TableCell>
                <TableCell><Badge variant="destructive">HIGH</Badge></TableCell>
                <TableCell><Badge>IN_PROGRESS</Badge></TableCell>
                <TableCell>{formatDate(new Date())}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
