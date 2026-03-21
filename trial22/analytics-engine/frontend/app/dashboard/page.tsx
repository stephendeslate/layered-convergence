// [TRACED:UI-008] Dashboard list page

import { getApiUrl } from '../../lib/utils';
import type { Dashboard } from '../../lib/types';

async function getDashboards(): Promise<Dashboard[]> {
  try {
    const response = await fetch(`${getApiUrl()}/dashboards`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      return [];
    }
    return response.json() as Promise<Dashboard[]>;
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const dashboards = await getDashboards();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboards</h1>
      {dashboards.length === 0 ? (
        <p className="text-muted-foreground">No dashboards found. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              <h2 className="text-lg font-semibold">{dashboard.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {dashboard.widgets?.length ?? 0} widgets
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
