'use client';

import { useSse } from '@/hooks/use-sse';
import { Badge } from '@/components/ui/badge';

interface PipelineMonitorProps {
  pipelineId: string;
}

export default function PipelineMonitor({ pipelineId }: PipelineMonitorProps) {
  const { messages, connected } = useSse(pipelineId);

  return (
    <div className="mt-2 p-3 border rounded-md bg-muted/30">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={connected ? 'default' : 'destructive'}>
          {connected ? 'Connected' : 'Disconnected'}
        </Badge>
        <span className="text-xs text-muted-foreground">Pipeline Monitor</span>
      </div>
      {messages.length > 0 && (
        <div className="text-xs font-mono space-y-1 max-h-32 overflow-y-auto">
          {messages.slice(-5).map((msg, i) => (
            <div key={i} className="text-muted-foreground">
              [{msg.timestamp}] {msg.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
