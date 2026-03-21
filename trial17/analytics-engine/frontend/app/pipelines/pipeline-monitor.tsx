'use client';

import { useSSE } from '@/hooks/use-sse';
import { Badge } from '@/components/ui/badge';
import type { Pipeline } from '@/lib/types';

interface PipelineMonitorProps {
  pipelineIds: string[];
}

interface PipelineEvent {
  pipelineId: string;
  status: Pipeline['status'];
  timestamp: string;
  message?: string;
}

export function PipelineMonitor({ pipelineIds }: PipelineMonitorProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const { data, isConnected, error } = useSSE<PipelineEvent>({
    url: `${apiUrl}/pipelines/events`,
    enabled: pipelineIds.length > 0,
  });

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Live Pipeline Monitor</h3>
        <Badge variant={isConnected ? 'success' : 'destructive'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
      {data && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Pipeline:</span>
            <span className="font-medium">{data.pipelineId}</span>
            <Badge variant="outline">{data.status}</Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(data.timestamp).toLocaleTimeString()}
            </span>
          </div>
          {data.message && (
            <p className="text-sm text-muted-foreground">{data.message}</p>
          )}
        </div>
      )}
      {!data && !error && (
        <p className="mt-2 text-sm text-muted-foreground">
          Waiting for pipeline events...
        </p>
      )}
    </div>
  );
}
