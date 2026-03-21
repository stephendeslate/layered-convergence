'use client';

import { WidgetRenderer } from '../widgets/WidgetRenderer';
import type { Widget } from '@/lib/api';

interface DashboardGridProps {
  widgets: Widget[];
  widgetData: Map<string, Record<string, unknown>[]>;
  onRemoveWidget?: (widgetId: string) => void;
  editable?: boolean;
}

export function DashboardGrid({
  widgets,
  widgetData,
  onRemoveWidget,
  editable = false,
}: DashboardGridProps) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: 'repeat(12, 1fr)',
        gridAutoRows: '80px',
      }}
    >
      {widgets.map((widget) => (
        <div
          key={widget.id}
          className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden relative"
          style={{
            gridColumn: `${(widget.position.col ?? 0) + 1} / span ${widget.size.colSpan ?? 6}`,
            gridRow: `${(widget.position.row ?? 0) + 1} / span ${widget.size.rowSpan ?? 4}`,
          }}
        >
          {editable && onRemoveWidget && (
            <button
              onClick={() => onRemoveWidget(widget.id)}
              className="absolute top-2 right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
              aria-label="Remove widget"
            >
              X
            </button>
          )}
          <WidgetRenderer
            type={widget.type}
            data={widgetData.get(widget.id) ?? []}
            config={widget.config}
            title={widget.title ?? undefined}
          />
        </div>
      ))}
    </div>
  );
}
