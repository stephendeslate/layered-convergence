// TRACED: FD-WORK-ORDERS-PAGE
import dynamic from 'next/dynamic';
import { fetchWorkOrders } from '../actions';
import { Badge } from '@/components/ui/badge';

const Table = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.Table),
);
const TableHeader = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableHeader),
);
const TableBody = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableBody),
);
const TableRow = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableRow),
);
const TableHead = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableHead),
);
const TableCell = dynamic(() =>
  import('@/components/ui/table').then((mod) => mod.TableCell),
);

interface WorkOrder {
  id: string;
  title: string;
  status: string;
  priority: string;
  address: string;
}

export default async function WorkOrdersPage() {
  let workOrders: { data: WorkOrder[] } = { data: [] };
  try {
    workOrders = await fetchWorkOrders();
  } catch {
    // Will show empty state
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Work Orders</h1>
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
          {workOrders.data.map((wo) => (
            <TableRow key={wo.id}>
              <TableCell>{wo.title}</TableCell>
              <TableCell>
                <Badge variant={wo.status === 'COMPLETED' ? 'default' : 'secondary'}>
                  {wo.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={wo.priority === 'URGENT' ? 'destructive' : 'outline'}>
                  {wo.priority}
                </Badge>
              </TableCell>
              <TableCell>{wo.address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
