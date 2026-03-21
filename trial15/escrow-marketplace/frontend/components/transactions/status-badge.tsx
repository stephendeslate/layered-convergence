import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils";
import type { TransactionStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: TransactionStatus;
}

const statusLabels: Record<TransactionStatus, string> = {
  PENDING: "Pending",
  FUNDED: "Funded",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  RELEASED: "Released",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
  RESOLVED: "Resolved",
  REFUNDED: "Refunded",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={getStatusColor(status)}>
      {statusLabels[status]}
    </Badge>
  );
}
