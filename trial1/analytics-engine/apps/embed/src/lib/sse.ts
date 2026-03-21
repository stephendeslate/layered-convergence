const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export type SSEHandler = (event: { widgetId: string; data: unknown[] }) => void;

export function connectSSE(
  dashboardId: string,
  apiKey: string | undefined,
  onWidgetUpdate: SSEHandler,
): () => void {
  const url = new URL(`${API_BASE}/sse/dashboards/${dashboardId}`);
  if (apiKey) {
    url.searchParams.set('apiKey', apiKey);
  }

  const eventSource = new EventSource(url.toString());

  eventSource.addEventListener('widget-update', (event) => {
    try {
      const parsed = JSON.parse(event.data);
      onWidgetUpdate(parsed);
    } catch {
      // Ignore malformed events
    }
  });

  eventSource.addEventListener('sync-status', () => {
    // Informational — could trigger a refresh
  });

  eventSource.onerror = () => {
    // SSE will auto-reconnect
  };

  return () => {
    eventSource.close();
  };
}
