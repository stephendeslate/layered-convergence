"use client";

import { useRef, useEffect } from "react";
import { useSSE } from "@/hooks/use-sse";
import type { PipelineStatusEvent, PipelineStatus as PipelineStatusType } from "@/lib/types";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";

interface PipelineStatusProps {
  pipelineId: string;
  initialStatus: PipelineStatusType;
  token?: string;
  tenantId?: string;
}

const statusVariantMap: Record<PipelineStatusType, BadgeVariant> = {
  idle: "secondary",
  running: "warning",
  completed: "success",
  failed: "destructive",
  cancelled: "default",
};

const statusLabelMap: Record<PipelineStatusType, string> = {
  idle: "Idle",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

function ProgressBar({ progress }: { progress: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const rounded = Math.round(progress);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${rounded}%`;
    }
  }, [rounded]);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{rounded}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Pipeline progress"
      >
        <div
          ref={barRef}
          className="h-full rounded-full bg-primary transition-all"
        />
      </div>
    </div>
  );
}

function PipelineStatusIndicator({
  pipelineId,
  initialStatus,
  token,
  tenantId,
}: PipelineStatusProps) {
  const sseUrl = apiClient.getPipelineStatusUrl(pipelineId);

  const { data, isConnected, error, reconnect } = useSSE<PipelineStatusEvent>({
    url: sseUrl,
    token,
    tenantId,
    enabled: true,
  });

  const currentStatus = data?.status ?? initialStatus;
  const progress = data?.progress ?? 0;
  const message = data?.message ?? "";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Badge variant={statusVariantMap[currentStatus]}>
          {statusLabelMap[currentStatus]}
        </Badge>
        <span
          className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          aria-label={isConnected ? "Connected to live updates" : "Disconnected from live updates"}
          role="status"
        />
      </div>

      {currentStatus === "running" && <ProgressBar progress={progress} />}

      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}

      {error && (
        <div className="flex items-center gap-2">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={reconnect}>
            Reconnect
          </Button>
        </div>
      )}
    </div>
  );
}

export { PipelineStatusIndicator, type PipelineStatusProps };
