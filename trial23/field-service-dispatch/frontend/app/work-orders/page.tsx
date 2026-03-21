import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Work Orders</h1>
        <Button>Create Work Order</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Link href="/work-orders/example" className="text-[var(--primary)] hover:underline">
                Sample Work Order
              </Link>
            </TableCell>
            <TableCell><Badge>OPEN</Badge></TableCell>
            <TableCell>High</TableCell>
            <TableCell>Acme Corp</TableCell>
            <TableCell>--</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">View</Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
