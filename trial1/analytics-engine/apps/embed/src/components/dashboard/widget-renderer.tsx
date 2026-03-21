'use client';

import { useEffect, useState } from 'react';
import type { Widget } from '@analytics-engine/shared';
import { WidgetType } from '@analytics-engine/shared';
import {
  EmbedLineChart,
  EmbedBarChart,
  EmbedPieChart,
  EmbedAreaChart,
  EmbedKpiCard,
  EmbedDataTable,
  EmbedFunnelChart,
} from '@/components/charts';
import { fetchWidgetData } from '@/lib/api-client';

interface WidgetRendererProps {
  widget: Widget;
  height?: number;
  apiKey?: string;
  primaryColor?: string;
  overrideData?: unknown[] | null;
}

interface WidgetData {
  rows: Record<string, unknown>[];
  summary?: { value: number; change?: number };
}

export function EmbedWidgetRenderer({
  widget,
  height = 280,
  apiKey,
  primaryColor,
  overrideData,
}: WidgetRendererProps) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (overrideData) {
      setData({ rows: overrideData as Record<string, unknown>[] });
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetchWidgetData(widget.id, apiKey)
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [widget.id, apiKey, overrideData]);

  if (loading) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: 20,
            height: 20,
            border: '2px solid #e5e7eb',
            borderTopColor: '#6b7280',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, opacity: 0.5 }}>
        No data
      </div>
    );
  }

  const metricKeys = widget.metricFields.map(m => m.field);
  const dimensionKey = widget.dimensionField;

  switch (widget.type) {
    case WidgetType.LINE:
      return <EmbedLineChart data={data.rows} dimensionKey={dimensionKey} metricKeys={metricKeys} height={height} primaryColor={primaryColor} />;
    case WidgetType.BAR:
      return <EmbedBarChart data={data.rows} dimensionKey={dimensionKey} metricKeys={metricKeys} height={height} primaryColor={primaryColor} stacked={(widget.typeConfig?.mode as string) === 'stacked'} />;
    case WidgetType.PIE_DONUT:
      return <EmbedPieChart data={data.rows} nameKey={dimensionKey} valueKey={metricKeys[0]} height={height} innerRadius={(widget.typeConfig?.innerRadius as number) ?? 0} />;
    case WidgetType.AREA:
      return <EmbedAreaChart data={data.rows} dimensionKey={dimensionKey} metricKeys={metricKeys} height={height} primaryColor={primaryColor} stacked={(widget.typeConfig?.stacked as boolean) ?? false} />;
    case WidgetType.KPI_CARD:
      return <EmbedKpiCard title={widget.title} value={data.summary?.value ?? 0} prefix={(widget.typeConfig?.prefix as string) ?? ''} suffix={(widget.typeConfig?.suffix as string) ?? ''} change={data.summary?.change} primaryColor={primaryColor} />;
    case WidgetType.TABLE:
      return <EmbedDataTable data={data.rows} columns={[dimensionKey, ...metricKeys]} pageSize={(widget.typeConfig?.pageSize as number) ?? 10} />;
    case WidgetType.FUNNEL:
      return <EmbedFunnelChart data={data.rows} nameKey={dimensionKey} valueKey={metricKeys[0]} height={height} />;
    default:
      return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, opacity: 0.5 }}>Unknown widget type</div>;
  }
}
