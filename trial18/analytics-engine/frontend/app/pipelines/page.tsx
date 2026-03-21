import { Suspense } from 'react';
import { fetchPipelines } from '@/lib/api';
import { PipelineCard } from '@/components/dashboard/pipeline-card';
import { TransitionButtons } from '@/components/dashboard/transition-buttons';
import PipelineMonitor from './pipeline-monitor';

async function PipelineList() {
  const pipelines = await fetchPipelines();

  if (pipelines.length === 0) {
    return <p className="text-muted-foreground">No pipelines configured.</p>;
  }

  return (
    <div className="space-y-4">
      {pipelines.map((p) => (
        <div key={p.id}>
          <PipelineCard pipeline={p} />
          <TransitionButtons pipelineId={p.id} currentStatus={p.status} />
          {p.status === 'ACTIVE' && <PipelineMonitor pipelineId={p.id} />}
        </div>
      ))}
    </div>
  );
}

export default function PipelinesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pipelines</h1>
      <Suspense fallback={<div aria-busy="true">Loading pipelines...</div>}>
        <PipelineList />
      </Suspense>
    </div>
  );
}
