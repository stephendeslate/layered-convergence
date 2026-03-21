const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchDashboard(dashboardId: string, apiKey?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const res = await fetch(`${API_BASE}/embed/dashboards/${dashboardId}`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard: ${res.status}`);
  }
  return res.json();
}

export async function fetchWidgetData(widgetId: string, apiKey?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }

  const res = await fetch(`${API_BASE}/embed/widgets/${widgetId}/data`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch widget data: ${res.status}`);
  }
  return res.json();
}
