import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const WORK_ORDERS = [
  { id: 'wo-1', title: 'HVAC System Inspection', status: 'COMPLETED', priority: 2, technician: 'Alex Rivera' },
  { id: 'wo-2', title: 'Emergency Electrical Repair', status: 'CANCELLED', priority: 1, technician: 'Alex Rivera' },
  { id: 'wo-3', title: 'Plumbing Leak Assessment', status: 'PENDING', priority: 3, technician: null },
];

function statusVariant(status: string) {
  switch (status) {
    case 'COMPLETED': return 'default' as const;
    case 'IN_PROGRESS': return 'secondary' as const;
    case 'CANCELLED': return 'destructive' as const;
    default: return 'outline' as const;
  }
}

export default function WorkOrdersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Technician</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WORK_ORDERS.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell>{wo.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(wo.status)}>{wo.status}</Badge>
                  </TableCell>
                  <TableCell>{wo.priority}</TableCell>
                  <TableCell>{wo.technician ?? 'Unassigned'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
