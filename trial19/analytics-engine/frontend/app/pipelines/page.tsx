import { fetchPipelines } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TransitionButtons } from './transition-buttons';
import Link from 'next/link';

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  DRAFT: 'secondary',
  ACTIVE: 'default',
  PAUSED: 'outline',
  ARCHIVED: 'destructive',
};

export default async function PipelinesPage() {
  let pipelines;
  try {
    pipelines = await fetchPipelines();
  } catch {
    pipelines = [];
  }

  return (
    <div className="space-y-6" aria-live="polite">
      <h1 className="text-2xl font-bold">Pipelines</h1>
      {pipelines.length === 0 ? (
        <p className="text-muted-foreground">No pipelines configured yet.</p>
      ) : (
        <div className="space-y-4">
          {pipelines.map((pipeline) => (
            <Card key={pipeline.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      <Link href={`/pipelines/${pipeline.id}`} className="hover:underline">
                        {pipeline.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{pipeline.description ?? 'No description'}</CardDescription>
                  </div>
                  <Badge variant={STATUS_VARIANT[pipeline.status] ?? 'outline'}>
                    {pipeline.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <TransitionButtons pipelineId={pipeline.id} currentStatus={pipeline.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
