'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { EmbedRenderData } from '@/lib/api';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { applyTheme } from '@/lib/theme';

export default function EmbedPage() {
  const { embedId } = useParams<{ embedId: string }>();
  const [embedData, setEmbedData] = useState<EmbedRenderData | null>(null);
  const [widgetData, setWidgetData] = useState<Map<string, Record<string, unknown>[]>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (!embedId) return;
    api.embeds.render(embedId).then((data) => {
      setEmbedData(data);
      applyTheme(data.branding, data.themeOverrides);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load embed');
    });
  }, [embedId]);

  const sendToParent = useCallback((message: Record<string, unknown>) => {
    if (!parentOrigin || !window.parent || window.parent === window) return;
    window.parent.postMessage(
      { source: 'analytics-engine', ...message },
      parentOrigin,
    );
  }, [parentOrigin]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.origin || event.origin === 'null') return;

      const data = event.data;
      if (typeof data !== 'object' || data === null) return;
      if (data.source !== 'analytics-engine-host') return;

      if (data.type === 'init') {
        setParentOrigin(event.origin);
        sendToParent({ type: 'ready', embedId });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [embedId, sendToParent]);

  useEffect(() => {
    if (!embedData) return;
    sendToParent({ type: 'loaded', dashboardId: embedData.dashboard.id });
  }, [embedData, sendToParent]);

  useEffect(() => {
    if (!embedData) return;

    const fetchAll = async () => {
      const dataMap = new Map<string, Record<string, unknown>[]>();
      await Promise.allSettled(
        embedData.dashboard.widgets.map(async (w) => {
          if (!w.dataSourceId) return;
          try {
            const config = w.config;
            const metrics = Array.isArray(config.metrics)
              ? (config.metrics as string[])
              : config.metric
                ? [config.metric as string]
                : [];
            const dimensions = config.dimension ? [config.dimension as string] : [];

            const result = await api.query.execute('', {
              dataSourceId: w.dataSourceId,
              metrics,
              dimensions,
              dateRange: { preset: (config.dateRange as string) ?? '30d' },
            });
            dataMap.set(w.id, result.data);
          } catch {
            dataMap.set(w.id, []);
          }
        }),
      );
      setWidgetData(dataMap);
    };

    fetchAll();
  }, [embedData]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!embedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ fontFamily: 'var(--analytics-font-family)' }}>
      <DashboardGrid
        widgets={embedData.dashboard.widgets}
        widgetData={widgetData}
      />
    </div>
  );
}
