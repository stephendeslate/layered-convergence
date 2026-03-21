import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./status-badge";
import type { WorkOrder } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, User, Wrench } from "lucide-react";

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 border-blue-300",
  HIGH: "bg-amber-100 text-amber-700 border-amber-300",
  URGENT: "bg-red-100 text-red-700 border-red-300",
};

interface WorkOrderCardProps {
  workOrder: WorkOrder;
}

export function WorkOrderCard({ workOrder }: WorkOrderCardProps) {
  return (
    <Link href={`/work-orders/${workOrder.id}`}>
      <Card
        className="hover:shadow-md transition-shadow cursor-pointer"
        data-testid="work-order-card"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold line-clamp-1">
              {workOrder.title}
            </CardTitle>
            <StatusBadge status={workOrder.status} />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={priorityColors[workOrder.priority]}
            >
              {workOrder.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {workOrder.customer && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{workOrder.customer.name}</span>
            </div>
          )}
          {workOrder.technician && (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{workOrder.technician.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{workOrder.address}</span>
          </div>
          {workOrder.scheduledDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{formatDate(workOrder.scheduledDate)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
