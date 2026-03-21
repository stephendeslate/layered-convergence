import { Suspense } from 'react';
import { ApiClient } from '@/lib/api';
import { PipelineCard } from '@/components/dashboard/pipeline-card';
import { PipelineMonitor } from './pipeline-monitor';

async function PipelineList() {
  const pipelines = await ApiClient.getPipelines();

  if (pipelines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">No pipelines configured</p>
        <p className="text-sm text-muted-foreground">
          Pipelines are created from data source configurations
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pipelines.map((pipeline) => (
          <PipelineCard key={pipeline.id} pipeline={pipeline} />
        ))}
      </div>
      <PipelineMonitor pipelineIds={pipelines.map((p) => p.id)} />
    </div>
  );
}

function PipelineListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`pl-skeleton-${i}`}
          className="h-48 animate-pulse rounded-lg border bg-muted"
        />
      ))}
    </div>
  );
}

export default function PipelinesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipelines</h1>
        <p className="text-muted-foreground">
          Monitor and manage data ingestion pipelines
        </p>
      </div>

      <Suspense fallback={<PipelineListSkeleton />}>
        <PipelineList />
      </Suspense>
    </div>
  );
}
