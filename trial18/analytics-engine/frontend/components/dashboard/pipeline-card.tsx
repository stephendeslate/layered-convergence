import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Pipeline } from '@/lib/types';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  ACTIVE: 'default',
  PAUSED: 'outline',
  FAILED: 'destructive',
  COMPLETED: 'default',
};

interface PipelineCardProps {
  pipeline: Pipeline;
}

export function PipelineCard({ pipeline }: PipelineCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{pipeline.name}</CardTitle>
          <Badge variant={statusColors[pipeline.status] ?? 'outline'}>
            {pipeline.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {pipeline.description && <p className="text-sm text-muted-foreground mb-2">{pipeline.description}</p>}
        <p className="text-xs text-muted-foreground">Data Source: {pipeline.dataSource?.name ?? pipeline.dataSourceId}</p>
        <p className="text-xs text-muted-foreground">Created: {new Date(pipeline.createdAt).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );
}
