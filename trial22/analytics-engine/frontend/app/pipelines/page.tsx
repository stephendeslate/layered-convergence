// [TRACED:UI-014] Pipelines list page with status badges

import { getApiUrl } from '../../lib/utils';
import type { Pipeline } from '../../lib/types';

async function getPipelines(): Promise<Pipeline[]> {
  try {
    const response = await fetch(`${getApiUrl()}/pipelines`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    return response.json() as Promise<Pipeline[]>;
  } catch {
    return [];
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'PAUSED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
}

export default async function PipelinesPage() {
  const pipelines = await getPipelines();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Pipelines</h1>
      {pipelines.length === 0 ? (
        <p className="text-muted-foreground">No pipelines found. Create one to start processing data.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pipelines.map((pipeline) => (
            <div
              key={pipeline.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{pipeline.name}</h2>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColor(pipeline.status)}`}
                >
                  {pipeline.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
