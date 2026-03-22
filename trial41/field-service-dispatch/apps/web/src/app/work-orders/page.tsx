import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Work Orders</h1>
        <Button>Create Work Order</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Fix broken AC unit</TableCell>
            <TableCell><Badge>Assigned</Badge></TableCell>
            <TableCell>2</TableCell>
            <TableCell>350 5th Ave, New York</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Failed electrical inspection</TableCell>
            <TableCell><Badge variant="destructive">Failed</Badge></TableCell>
            <TableCell>3</TableCell>
            <TableCell>1 Times Square, New York</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
