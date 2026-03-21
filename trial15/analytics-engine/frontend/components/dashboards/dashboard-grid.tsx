import type { Widget } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardGridProps {
  widgets: Widget[];
}

const widgetTypeLabels: Record<string, string> = {
  "line-chart": "Line Chart",
  "bar-chart": "Bar Chart",
  "pie-chart": "Pie Chart",
  metric: "Metric",
  table: "Table",
  "area-chart": "Area Chart",
};

function DashboardGrid({ widgets }: DashboardGridProps) {
  if (widgets.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <p className="text-muted-foreground">
          No widgets configured. Add a widget to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="list"
      aria-label="Dashboard widgets"
    >
      {widgets.map((widget) => (
        <div key={widget.id} role="listitem">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{widget.title}</CardTitle>
                <Badge variant="secondary">
                  {widgetTypeLabels[widget.type] ?? widget.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center rounded-md bg-muted">
                <p className="text-sm text-muted-foreground">
                  {widgetTypeLabels[widget.type] ?? widget.type} visualization
                </p>
              </div>
              <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Refresh interval</dt>
                  <dd>{widget.config.refreshInterval}s</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Position</dt>
                  <dd>
                    {widget.position.x},{widget.position.y} ({widget.position.width}x
                    {widget.position.height})
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

export { DashboardGrid, type DashboardGridProps };
