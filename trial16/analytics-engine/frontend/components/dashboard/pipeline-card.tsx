import type { Pipeline } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'destructive' | 'warning'> = {
  DRAFT: 'default',
  ACTIVE: 'success',
  PAUSED: 'warning',
  COMPLETED: 'success',
  FAILED: 'destructive',
};

interface PipelineCardProps {
  pipeline: Pipeline;
}

export function PipelineCard({ pipeline }: PipelineCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{pipeline.name}</CardTitle>
          <Badge variant={STATUS_VARIANTS[pipeline.status] ?? 'outline'}>
            {pipeline.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          {pipeline.description && (
            <div>
              <dt className="text-muted-foreground">Description</dt>
              <dd className="font-medium">{pipeline.description}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Data Source</dt>
            <dd className="font-medium">
              {pipeline.dataSource?.name ?? pipeline.dataSourceId}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
