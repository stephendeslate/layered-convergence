// TRACED: FD-UI-WO-001 — Work orders list page with table and status badges
// TRACED: FD-UI-WO-002 — Work order priority display with color-coded badges
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { truncateText, formatCoordinates } from '@field-service-dispatch/shared';
import type { WorkOrderStatus, WorkOrderPriority } from '@field-service-dispatch/shared';

const statusVariant: Record<WorkOrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  OPEN: 'outline',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
  FAILED: 'destructive',
};

const priorityLabel: Record<WorkOrderPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const mockWorkOrders = [
  {
    id: 'wo-001',
    title: 'Replace rooftop HVAC unit serving third floor offices in main building',
    status: 'OPEN' as WorkOrderStatus,
    priority: 'HIGH' as WorkOrderPriority,
    assignee: 'Maria Garcia',
    location: { lat: '40.7580000', lng: '-73.9855000' },
    createdAt: '2026-03-18',
  },
  {
    id: 'wo-002',
    title: 'Annual fire suppression system inspection and certification renewal',
    status: 'IN_PROGRESS' as WorkOrderStatus,
    priority: 'URGENT' as WorkOrderPriority,
    assignee: 'James Chen',
    location: { lat: '40.7484000', lng: '-73.9857000' },
    createdAt: '2026-03-17',
  },
  {
    id: 'wo-003',
    title: 'Electrical panel upgrade from 200A to 400A service',
    status: 'COMPLETED' as WorkOrderStatus,
    priority: 'MEDIUM' as WorkOrderPriority,
    assignee: 'Sarah Okafor',
    location: { lat: '40.7527000', lng: '-73.9772000' },
    createdAt: '2026-03-15',
  },
  {
    id: 'wo-004',
    title: 'Emergency plumbing repair in basement mechanical room',
    status: 'FAILED' as WorkOrderStatus,
    priority: 'URGENT' as WorkOrderPriority,
    assignee: 'James Chen',
    location: { lat: '40.7614000', lng: '-73.9776000' },
    createdAt: '2026-03-14',
  },
  {
    id: 'wo-005',
    title: 'Parking garage lighting retrofit to LED fixtures',
    status: 'CANCELLED' as WorkOrderStatus,
    priority: 'LOW' as WorkOrderPriority,
    assignee: 'Tom Rivera',
    location: { lat: '40.7488000', lng: '-73.9680000' },
    createdAt: '2026-03-12',
  },
];

export default function WorkOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Work Orders</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Manage and track all field service work orders.
          </p>
        </div>
        <Badge variant="secondary">{mockWorkOrders.length} total</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-[var(--muted-foreground)]">
            All Work Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockWorkOrders.map((wo) => (
                <TableRow key={wo.id}>
                  <TableCell className="font-mono text-xs">{wo.id}</TableCell>
                  <TableCell>{truncateText(wo.title, 45)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[wo.status]}>{wo.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={wo.priority === 'URGENT' ? 'destructive' : 'outline'}>
                      {priorityLabel[wo.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>{wo.assignee}</TableCell>
                  <TableCell className="text-xs">
                    {formatCoordinates(wo.location.lat, wo.location.lng)}
                  </TableCell>
                  <TableCell className="text-xs text-[var(--muted-foreground)]">
                    {wo.createdAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
