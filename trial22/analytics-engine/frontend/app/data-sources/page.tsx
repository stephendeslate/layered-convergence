// [TRACED:UI-011] Data sources list page

import { getApiUrl } from '../../lib/utils';
import type { DataSource } from '../../lib/types';

async function getDataSources(): Promise<DataSource[]> {
  try {
    const response = await fetch(`${getApiUrl()}/data-sources`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    return response.json() as Promise<DataSource[]>;
  } catch {
    return [];
  }
}

export default async function DataSourcesPage() {
  const dataSources = await getDataSources();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Data Sources</h1>
      {dataSources.length === 0 ? (
        <p className="text-muted-foreground">No data sources configured. Add one to begin importing data.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dataSources.map((ds) => (
            <div
              key={ds.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h2 className="text-lg font-semibold">{ds.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Type: {ds.type}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
