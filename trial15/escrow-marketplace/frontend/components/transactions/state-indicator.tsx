"use client";

import { useActionState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TransactionStatus, TransactionTransition, UserRole } from "@/lib/types";
import { getStatusColor } from "@/lib/utils";

interface StateIndicatorProps {
  transactionId: string;
  status: TransactionStatus;
  userRole: UserRole;
  transitionAction: (
    prevState: { error: string | null; success: boolean },
    formData: FormData
  ) => Promise<{ error: string | null; success: boolean }>;
}

interface AvailableAction {
  action: TransactionTransition;
  label: string;
  variant: "default" | "destructive" | "outline";
  allowedRoles: UserRole[];
}

const STATE_ACTIONS: Record<TransactionStatus, AvailableAction[]> = {
  PENDING: [
    { action: "fund", label: "Fund Escrow", variant: "default", allowedRoles: ["BUYER", "ADMIN"] },
    { action: "cancel", label: "Cancel", variant: "destructive", allowedRoles: ["BUYER", "SELLER", "ADMIN"] },
  ],
  FUNDED: [
    { action: "ship", label: "Mark Shipped", variant: "default", allowedRoles: ["SELLER", "ADMIN"] },
    { action: "dispute", label: "Open Dispute", variant: "destructive", allowedRoles: ["BUYER", "ADMIN"] },
  ],
  SHIPPED: [
    { action: "deliver", label: "Confirm Delivery", variant: "default", allowedRoles: ["BUYER", "ADMIN"] },
  ],
  DELIVERED: [
    { action: "release", label: "Release Funds", variant: "default", allowedRoles: ["BUYER", "ADMIN"] },
  ],
  RELEASED: [],
  CANCELLED: [],
  DISPUTED: [],
  RESOLVED: [
    { action: "release", label: "Release Funds", variant: "default", allowedRoles: ["ADMIN"] },
  ],
  REFUNDED: [],
};

const STATUS_DESCRIPTIONS: Record<TransactionStatus, string> = {
  PENDING: "Waiting for buyer to fund escrow",
  FUNDED: "Funds held in escrow, waiting for seller to ship",
  SHIPPED: "Item shipped, waiting for buyer to confirm delivery",
  DELIVERED: "Delivery confirmed, buyer can release funds",
  RELEASED: "Funds released to seller, transaction complete",
  CANCELLED: "Transaction has been cancelled",
  DISPUTED: "Transaction is under dispute review",
  RESOLVED: "Dispute has been resolved",
  REFUNDED: "Funds have been refunded to buyer",
};

export function StateIndicator({
  transactionId,
  status,
  userRole,
  transitionAction,
}: StateIndicatorProps) {
  const [state, formAction, isPending] = useActionState(transitionAction, {
    error: null,
    success: false,
  });

  const availableActions = STATE_ACTIONS[status].filter((a) =>
    a.allowedRoles.includes(userRole)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">Current Status:</span>
        <Badge className={getStatusColor(status)}>{status}</Badge>
      </div>
      <p className="text-sm text-gray-600">{STATUS_DESCRIPTIONS[status]}</p>

      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">
          Transaction updated successfully
        </div>
      )}

      {availableActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableActions.map((actionDef) => (
            <form key={actionDef.action} action={formAction}>
              <input type="hidden" name="transactionId" value={transactionId} />
              <input type="hidden" name="action" value={actionDef.action} />
              <Button
                type="submit"
                variant={actionDef.variant}
                disabled={isPending}
              >
                {isPending ? "Processing..." : actionDef.label}
              </Button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
