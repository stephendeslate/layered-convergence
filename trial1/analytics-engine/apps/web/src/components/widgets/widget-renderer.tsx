'use client';

import { useEffect, useState } from 'react';
import type { Widget } from '@analytics-engine/shared';
import { WidgetType } from '@analytics-engine/shared';
import { LineChart, BarChart, PieChart, AreaChart, KpiCard, DataTable, FunnelChart } from '@/components/charts';
import { apiClient } from '@/lib/api-client';
import { Spinner } from '@/components/ui/spinner';

interface WidgetRendererProps {
  widget: Widget;
  height?: number;
}

interface WidgetData {
  rows: Record<string, unknown>[];
  summary?: { value: number; change?: number };
}

export function WidgetRenderer({ widget, height = 280 }: WidgetRendererProps) {
  const [data, setData] = useState<WidgetData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    apiClient
      .get<WidgetData>(`/query/widget/${widget.id}`)
      .then((res) => {
        if (!cancelled) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load widget data');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [widget.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Spinner size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-sm text-red-500" style={{ height }}>
        {error}
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
        No data available
      </div>
    );
  }

  const metricKeys = widget.metricFields.map((m) => m.field);
  const dimensionKey = widget.dimensionField;

  switch (widget.type) {
    case WidgetType.LINE:
      return (
        <LineChart
          data={data.rows}
          dimensionKey={dimensionKey}
          metricKeys={metricKeys}
          height={height}
          curveType={(widget.typeConfig?.curveType as 'monotone' | 'linear') ?? 'monotone'}
        />
      );
    case WidgetType.BAR:
      return (
        <BarChart
          data={data.rows}
          dimensionKey={dimensionKey}
          metricKeys={metricKeys}
          height={height}
          stacked={(widget.typeConfig?.mode as string) === 'stacked'}
        />
      );
    case WidgetType.PIE_DONUT:
      return (
        <PieChart
          data={data.rows}
          nameKey={dimensionKey}
          valueKey={metricKeys[0]}
          height={height}
          innerRadius={(widget.typeConfig?.innerRadius as number) ?? 0}
        />
      );
    case WidgetType.AREA:
      return (
        <AreaChart
          data={data.rows}
          dimensionKey={dimensionKey}
          metricKeys={metricKeys}
          height={height}
          stacked={(widget.typeConfig?.stacked as boolean) ?? false}
          fillOpacity={(widget.typeConfig?.fillOpacity as number) ?? 0.3}
        />
      );
    case WidgetType.KPI_CARD:
      return (
        <KpiCard
          title={widget.title}
          value={data.summary?.value ?? 0}
          prefix={(widget.typeConfig?.prefix as string) ?? ''}
          suffix={(widget.typeConfig?.suffix as string) ?? ''}
          change={data.summary?.change}
          height={height}
        />
      );
    case WidgetType.TABLE:
      return (
        <DataTable
          data={data.rows}
          columns={[dimensionKey, ...metricKeys]}
          pageSize={(widget.typeConfig?.pageSize as number) ?? 10}
          height={height}
        />
      );
    case WidgetType.FUNNEL:
      return (
        <FunnelChart
          data={data.rows}
          nameKey={dimensionKey}
          valueKey={metricKeys[0]}
          height={height}
        />
      );
    default:
      return (
        <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
          Unknown widget type: {widget.type}
        </div>
      );
  }
}
