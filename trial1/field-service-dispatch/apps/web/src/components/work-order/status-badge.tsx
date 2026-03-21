import type { WorkOrderStatus, Priority } from '@fsd/shared';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS, PRIORITY_COLORS } from '@/lib/constants';

const STATUS_LABELS: Record<string, string> = {
  UNASSIGNED: 'Unassigned',
  ASSIGNED: 'Assigned',
  EN_ROUTE: 'En Route',
  ON_SITE: 'On Site',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  INVOICED: 'Invoiced',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
};

export function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <Badge className={`${colors.bg} ${colors.text} border-0`}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const colors = PRIORITY_COLORS[priority];
  return (
    <Badge className={`${colors.bg} ${colors.text} border-0`}>
      {priority}
    </Badge>
  );
}
