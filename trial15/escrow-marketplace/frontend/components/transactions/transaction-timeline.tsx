import { cn } from "@/lib/utils";
import type { Transaction, TransactionStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface TransactionTimelineProps {
  transaction: Transaction;
}

interface TimelineStep {
  status: TransactionStatus;
  label: string;
  dateField: keyof Transaction;
}

const HAPPY_PATH: TimelineStep[] = [
  { status: "PENDING", label: "Created", dateField: "createdAt" },
  { status: "FUNDED", label: "Funded", dateField: "fundedAt" },
  { status: "SHIPPED", label: "Shipped", dateField: "shippedAt" },
  { status: "DELIVERED", label: "Delivered", dateField: "deliveredAt" },
  { status: "RELEASED", label: "Released", dateField: "releasedAt" },
];

const STATUS_ORDER: Record<TransactionStatus, number> = {
  PENDING: 0,
  FUNDED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  RELEASED: 4,
  CANCELLED: -1,
  DISPUTED: 1.5,
  RESOLVED: 2.5,
  REFUNDED: -2,
};

function getStepState(
  stepStatus: TransactionStatus,
  currentStatus: TransactionStatus
): "completed" | "current" | "upcoming" {
  const stepOrder = STATUS_ORDER[stepStatus];
  const currentOrder = STATUS_ORDER[currentStatus];

  if (stepOrder < currentOrder) return "completed";
  if (stepOrder === currentOrder) return "current";
  return "upcoming";
}

export function TransactionTimeline({ transaction }: TransactionTimelineProps) {
  const isCancelled = transaction.status === "CANCELLED";
  const isDisputed =
    transaction.status === "DISPUTED" || transaction.status === "RESOLVED";
  const isRefunded = transaction.status === "REFUNDED";

  return (
    <div className="space-y-4" role="list" aria-label="Transaction timeline">
      <div className="flex items-center gap-2">
        {HAPPY_PATH.map((step, index) => {
          const state = getStepState(step.status, transaction.status);
          const dateValue = transaction[step.dateField];
          const dateStr = typeof dateValue === "string" ? dateValue : null;

          return (
            <div key={step.status} className="flex items-center" role="listitem">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                    state === "completed" &&
                      "border-green-500 bg-green-500 text-white",
                    state === "current" &&
                      "border-blue-500 bg-blue-50 text-blue-600",
                    state === "upcoming" &&
                      "border-gray-300 bg-white text-gray-400"
                  )}
                  role="img"
                  aria-label={`${step.label}: ${state}`}
                >
                  {state === "completed" ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 text-xs",
                    state === "current"
                      ? "font-semibold text-blue-600"
                      : "text-gray-500"
                  )}
                >
                  {step.label}
                </span>
                {dateStr && (
                  <span className="text-[10px] text-gray-400">
                    {formatDate(dateStr)}
                  </span>
                )}
              </div>
              {index < HAPPY_PATH.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 w-8",
                    state === "completed" ? "bg-green-500" : "bg-gray-200"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>

      {isCancelled && (
        <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          Transaction was <span className="font-semibold text-gray-800">cancelled</span>
          {transaction.cancelledAt && (
            <span> on {formatDate(transaction.cancelledAt)}</span>
          )}
        </div>
      )}

      {isDisputed && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          Transaction is <span className="font-semibold">under dispute</span>
          {transaction.disputedAt && (
            <span> since {formatDate(transaction.disputedAt)}</span>
          )}
          {transaction.status === "RESOLVED" && transaction.resolvedAt && (
            <span>
              {" "}
              - Resolved on {formatDate(transaction.resolvedAt)}
            </span>
          )}
        </div>
      )}

      {isRefunded && (
        <div className="rounded-md bg-orange-50 p-3 text-sm text-orange-700">
          Transaction was <span className="font-semibold">refunded</span> to the buyer
        </div>
      )}
    </div>
  );
}
