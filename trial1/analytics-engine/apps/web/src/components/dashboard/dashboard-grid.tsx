'use client';

import type { Widget } from '@analytics-engine/shared';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { WidgetRenderer } from '@/components/widgets/widget-renderer';

interface DashboardGridProps {
  widgets: Widget[];
  gridColumns?: number;
  onWidgetClick?: (widget: Widget) => void;
  editable?: boolean;
}

export function DashboardGrid({
  widgets,
  gridColumns = 12,
  onWidgetClick,
  editable = false,
}: DashboardGridProps) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
      }}
    >
      {widgets.map((widget) => (
        <div
          key={widget.id}
          style={{
            gridColumnStart: widget.gridColumnStart,
            gridColumnEnd: `span ${widget.gridColumnSpan}`,
            gridRowStart: widget.gridRowStart,
            gridRowEnd: `span ${widget.gridRowSpan}`,
          }}
          className={editable ? 'cursor-pointer ring-transparent hover:ring-2 hover:ring-blue-300 rounded-lg transition-shadow' : ''}
          onClick={() => onWidgetClick?.(widget)}
        >
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
              {widget.subtitle && (
                <CardDescription className="text-xs">{widget.subtitle}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <WidgetRenderer widget={widget} height={widget.gridRowSpan * 200 - 80} />
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
