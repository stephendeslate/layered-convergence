import { Badge } from "@/components/ui/badge";
import { cn, statusLabel } from "@/lib/utils";
import type { WorkOrderStatus } from "@/lib/types";

const statusColors: Record<WorkOrderStatus, string> = {
  CREATED: "bg-gray-100 text-gray-800 border-gray-300",
  ASSIGNED: "bg-blue-100 text-blue-800 border-blue-300",
  EN_ROUTE: "bg-indigo-100 text-indigo-800 border-indigo-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-300",
  ON_HOLD: "bg-orange-100 text-orange-800 border-orange-300",
  COMPLETED: "bg-green-100 text-green-800 border-green-300",
  INVOICED: "bg-purple-100 text-purple-800 border-purple-300",
  PAID: "bg-emerald-100 text-emerald-800 border-emerald-300",
  CLOSED: "bg-slate-100 text-slate-800 border-slate-300",
};

interface StatusBadgeProps {
  status: WorkOrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusColors[status], className)}
      data-testid={`status-badge-${status}`}
    >
      {statusLabel(status)}
    </Badge>
  );
}
