'use client';

import { WidgetType } from '@analytics-engine/shared';
import { LineChartWidget } from './LineChartWidget';
import { BarChartWidget } from './BarChartWidget';
import { PieChartWidget } from './PieChartWidget';
import { AreaChartWidget } from './AreaChartWidget';
import { KpiCardWidget } from './KpiCardWidget';
import { TableWidget } from './TableWidget';
import { FunnelWidget } from './FunnelWidget';

interface WidgetRendererProps {
  type: string;
  data: Record<string, unknown>[];
  config: Record<string, unknown>;
  title?: string;
}

export function WidgetRenderer({ type, data, config, title }: WidgetRendererProps) {
  switch (type) {
    case WidgetType.LINE:
      return (
        <LineChartWidget
          data={data}
          config={config as { metric: string; dimension: string; additionalMetrics?: string[] }}
          title={title}
        />
      );
    case WidgetType.BAR:
      return (
        <BarChartWidget
          data={data}
          config={config as { metric: string; dimension: string; orientation?: 'vertical' | 'horizontal' }}
          title={title}
        />
      );
    case WidgetType.PIE:
      return (
        <PieChartWidget
          data={data}
          config={config as { metric: string; dimension: string; donut?: boolean }}
          title={title}
        />
      );
    case WidgetType.AREA:
      return (
        <AreaChartWidget
          data={data}
          config={config as { metrics: string[]; dimension: string; stacked?: boolean }}
          title={title}
        />
      );
    case WidgetType.KPI:
      return (
        <KpiCardWidget
          data={data}
          config={config as { metric: string; prefix?: string; suffix?: string; format?: string }}
          title={title}
        />
      );
    case WidgetType.TABLE:
      return (
        <TableWidget
          data={data}
          config={config as { columns: Array<{ field: string; label: string; sortable?: boolean }>; pageSize?: number }}
          title={title}
        />
      );
    case WidgetType.FUNNEL:
      return (
        <FunnelWidget
          data={data}
          config={config as { stages: Array<{ name: string; metric: string }> }}
          title={title}
        />
      );
    default:
      return (
        <div className="h-full w-full flex items-center justify-center text-slate-400">
          Unknown widget type: {type}
        </div>
      );
  }
}
