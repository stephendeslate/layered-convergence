import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrderCard } from "./work-order-card";
import type { WorkOrder, WorkOrderStatus } from "@/lib/types";
import { WORK_ORDER_STATUSES } from "@/lib/types";
import { statusLabel } from "@/lib/utils";

interface StatusBoardProps {
  workOrders: WorkOrder[];
}

const columnColors: Record<WorkOrderStatus, string> = {
  CREATED: "border-t-gray-400",
  ASSIGNED: "border-t-blue-400",
  EN_ROUTE: "border-t-indigo-400",
  IN_PROGRESS: "border-t-yellow-400",
  ON_HOLD: "border-t-orange-400",
  COMPLETED: "border-t-green-400",
  INVOICED: "border-t-purple-400",
  PAID: "border-t-emerald-400",
  CLOSED: "border-t-slate-400",
};

export function StatusBoard({ workOrders }: StatusBoardProps) {
  const grouped = WORK_ORDER_STATUSES.reduce(
    (acc, status) => {
      acc[status] = workOrders.filter((wo) => wo.status === status);
      return acc;
    },
    {} as Record<WorkOrderStatus, WorkOrder[]>
  );

  return (
    <div
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      data-testid="status-board"
      role="region"
      aria-label="Work order status board"
    >
      {WORK_ORDER_STATUSES.map((status) => (
        <Card
          key={status}
          className={`border-t-4 ${columnColors[status]}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {statusLabel(status)}
              </CardTitle>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                {grouped[status].length}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {grouped[status].length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                No work orders
              </p>
            ) : (
              grouped[status].map((wo) => (
                <WorkOrderCard key={wo.id} workOrder={wo} />
              ))
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
