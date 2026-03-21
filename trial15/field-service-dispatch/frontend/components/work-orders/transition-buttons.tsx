"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { WorkOrderStatus } from "@/lib/types";

const transitions: Record<WorkOrderStatus, { label: string; action: string }[]> = {
  CREATED: [{ label: "Assign", action: "assign" }],
  ASSIGNED: [{ label: "Start Route", action: "en-route" }],
  EN_ROUTE: [{ label: "Begin Work", action: "start" }],
  IN_PROGRESS: [
    { label: "Put On Hold", action: "hold" },
    { label: "Complete", action: "complete" },
  ],
  ON_HOLD: [{ label: "Resume Work", action: "resume" }],
  COMPLETED: [{ label: "Create Invoice", action: "invoice" }],
  INVOICED: [{ label: "Mark Paid", action: "pay" }],
  PAID: [{ label: "Close", action: "close" }],
  CLOSED: [],
};

interface TransitionButtonsProps {
  workOrderId: string;
  currentStatus: WorkOrderStatus;
}

export function TransitionButtons({
  workOrderId,
  currentStatus,
}: TransitionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const available = transitions[currentStatus];

  if (available.length === 0) {
    return null;
  }

  async function handleTransition(action: string) {
    setLoading(action);
    setError(null);

    try {
      const response = await fetch(`/api/work-orders/${workOrderId}/${action}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const body = await response.text();
        let message = "Transition failed";
        try {
          const parsed = JSON.parse(body) as { message?: string };
          if (parsed.message) {
            message = parsed.message;
          }
        } catch {
          // use default
        }
        throw new Error(message);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3" data-testid="transition-buttons">
      <div className="flex flex-wrap gap-2">
        {available.map((transition) => (
          <Button
            key={transition.action}
            onClick={() => handleTransition(transition.action)}
            disabled={loading !== null}
            variant={transition.action === "hold" ? "outline" : "default"}
          >
            {loading === transition.action ? "Processing..." : transition.label}
          </Button>
        ))}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
