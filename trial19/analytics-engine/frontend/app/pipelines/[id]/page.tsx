import { fetchPipeline } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransitionButtons } from '../transition-buttons';

export default async function PipelineDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pipeline = await fetchPipeline(id);

  return (
    <div className="space-y-6" aria-live="polite">
      <h1 className="text-2xl font-bold">{pipeline.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge>{pipeline.status}</Badge>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Description:</span>
            <p>{pipeline.description ?? 'No description'}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Data Source:</span>
            <p>{pipeline.dataSource.name}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Transitions:</span>
            <TransitionButtons pipelineId={pipeline.id} currentStatus={pipeline.status} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
