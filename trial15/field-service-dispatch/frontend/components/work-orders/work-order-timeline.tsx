import { cn, statusLabel } from "@/lib/utils";
import type { WorkOrderStatus } from "@/lib/types";
import { WORK_ORDER_STATUSES } from "@/lib/types";
import { Check, Circle } from "lucide-react";

interface WorkOrderTimelineProps {
  currentStatus: WorkOrderStatus;
}

function getStatusIndex(status: WorkOrderStatus): number {
  return WORK_ORDER_STATUSES.indexOf(status);
}

export function WorkOrderTimeline({ currentStatus }: WorkOrderTimelineProps) {
  const currentIndex = getStatusIndex(currentStatus);

  return (
    <nav aria-label="Work order progress" data-testid="work-order-timeline">
      <ol className="flex flex-col gap-0">
        {WORK_ORDER_STATUSES.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <li key={status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 shrink-0",
                    isCompleted &&
                      "border-green-500 bg-green-500 text-white",
                    isCurrent &&
                      "border-blue-500 bg-blue-50 text-blue-600",
                    isPending &&
                      "border-gray-300 bg-white text-gray-400"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Circle className="h-3 w-3" aria-hidden="true" />
                  )}
                </div>
                {index < WORK_ORDER_STATUSES.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-6",
                      index < currentIndex
                        ? "bg-green-500"
                        : "bg-gray-300"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="pt-1">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-green-700",
                    isCurrent && "text-blue-700",
                    isPending && "text-gray-400"
                  )}
                >
                  {statusLabel(status)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
