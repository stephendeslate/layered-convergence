"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { TransactionStatus, TransactionTransition, UserRole } from "@/lib/types";

interface TransitionButtonsProps {
  transactionId: string;
  status: TransactionStatus;
  onTransition: (id: string, action: TransactionTransition) => Promise<void>;
}

interface AvailableAction {
  action: TransactionTransition;
  label: string;
  variant: "default" | "destructive" | "outline";
}

const STATE_ACTIONS: Record<TransactionStatus, AvailableAction[]> = {
  PENDING: [
    { action: "fund", label: "Fund Escrow", variant: "default" },
    { action: "cancel", label: "Cancel", variant: "destructive" },
  ],
  FUNDED: [
    { action: "ship", label: "Mark Shipped", variant: "default" },
    { action: "dispute", label: "Open Dispute", variant: "destructive" },
  ],
  SHIPPED: [
    { action: "deliver", label: "Confirm Delivery", variant: "default" },
  ],
  DELIVERED: [
    { action: "release", label: "Release Funds", variant: "default" },
  ],
  RELEASED: [],
  CANCELLED: [],
  DISPUTED: [],
  RESOLVED: [
    { action: "release", label: "Release Funds", variant: "default" },
  ],
  REFUNDED: [],
};

export function TransitionButtons({
  transactionId,
  status,
  onTransition,
}: TransitionButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const availableActions = STATE_ACTIONS[status];

  if (availableActions.length === 0) {
    return null;
  }

  function handleClick(action: TransactionTransition) {
    startTransition(async () => {
      await onTransition(transactionId, action);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {availableActions.map((actionDef) => (
        <Button
          key={actionDef.action}
          variant={actionDef.variant}
          disabled={isPending}
          onClick={() => handleClick(actionDef.action)}
        >
          {isPending ? "Processing..." : actionDef.label}
        </Button>
      ))}
    </div>
  );
}
