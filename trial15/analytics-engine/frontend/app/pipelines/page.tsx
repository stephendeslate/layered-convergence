"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useSSE } from "@/hooks/use-sse";
import type { Pipeline, PipelineStatusEvent } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function getCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

type PipelineStatusVariant = "default" | "success" | "warning" | "destructive" | "secondary";

function statusVariant(status: Pipeline["status"]): PipelineStatusVariant {
  const map: Record<Pipeline["status"], PipelineStatusVariant> = {
    idle: "secondary",
    running: "warning",
    completed: "success",
    failed: "destructive",
    cancelled: "default",
  };
  return map[status];
}

function ProgressBar({ progress }: { progress: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const rounded = Math.round(progress);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${rounded}%`;
    }
  }, [rounded]);

  return (
    <div className="flex-1">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          ref={barRef}
          className="h-full rounded-full bg-primary transition-all"
          role="progressbar"
          aria-valuenow={rounded}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Pipeline progress: ${rounded}%`}
        />
      </div>
    </div>
  );
}

interface PipelineSSEMonitorProps {
  pipelineId: string;
  onUpdate: (event: PipelineStatusEvent) => void;
}

function PipelineSSEMonitor({ pipelineId, onUpdate }: PipelineSSEMonitorProps) {
  const token = getCookieValue("auth-token");
  const tenantId = getCookieValue("tenant-id");
  const url = apiClient.getPipelineStatusUrl(pipelineId);

  const { data, isConnected, error } = useSSE<PipelineStatusEvent>({
    url,
    token,
    tenantId,
    enabled: true,
  });

  useEffect(() => {
    if (data) {
      onUpdate(data);
    }
  }, [data, onUpdate]);

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
        aria-label={isConnected ? "Connected" : "Disconnected"}
        role="status"
      />
      <span className="text-xs text-muted-foreground">
        {error ? "Connection error" : isConnected ? "Live" : "Connecting..."}
      </span>
    </div>
  );
}

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [monitoredPipelineId, setMonitoredPipelineId] = useState<string | null>(null);
  const [latestEvent, setLatestEvent] = useState<PipelineStatusEvent | null>(null);

  useEffect(() => {
    async function loadPipelines() {
      const token = getCookieValue("auth-token");
      const tenantId = getCookieValue("tenant-id");
      const options = { token, tenantId };

      try {
        const response = await apiClient.getPipelines(options);
        setPipelines(response.data);
      } finally {
        setIsLoading(false);
      }
    }

    loadPipelines();
  }, []);

  const handleTrigger = useCallback(async (pipelineId: string) => {
    setTriggeringId(pipelineId);
    const token = getCookieValue("auth-token");
    const tenantId = getCookieValue("tenant-id");
    const options = { token, tenantId };

    try {
      const updated = await apiClient.triggerPipeline(pipelineId, options);
      setPipelines((prev) =>
        prev.map((p) => (p.id === pipelineId ? updated : p))
      );
      setMonitoredPipelineId(pipelineId);
    } finally {
      setTriggeringId(null);
    }
  }, []);

  const handleSSEUpdate = useCallback((event: PipelineStatusEvent) => {
    setLatestEvent(event);
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === event.pipelineId ? { ...p, status: event.status } : p
      )
    );
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="h-9 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pipelines</h1>
      </div>

      {monitoredPipelineId && latestEvent && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Status</CardTitle>
            <CardDescription>
              Monitoring pipeline {monitoredPipelineId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <PipelineSSEMonitor
                pipelineId={monitoredPipelineId}
                onUpdate={handleSSEUpdate}
              />
              <Badge variant={statusVariant(latestEvent.status)}>
                {latestEvent.status}
              </Badge>
              <ProgressBar progress={latestEvent.progress} />
              <span className="text-sm font-medium">{Math.round(latestEvent.progress)}%</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{latestEvent.message}</p>
          </CardContent>
        </Card>
      )}

      {pipelines.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-lg font-medium text-muted-foreground">
              No pipelines configured
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pipelines will appear here once configured.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.map((pipeline) => (
                <TableRow key={pipeline.id}>
                  <TableCell className="font-medium">{pipeline.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {pipeline.description}
                  </TableCell>
                  <TableCell>
                    {pipeline.schedule ? (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {pipeline.schedule}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">Manual</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(pipeline.status)}>
                      {pipeline.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pipeline.lastRunAt
                      ? new Date(pipeline.lastRunAt).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrigger(pipeline.id)}
                      disabled={pipeline.status === "running" || triggeringId === pipeline.id}
                    >
                      {triggeringId === pipeline.id ? "Triggering..." : "Run"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
