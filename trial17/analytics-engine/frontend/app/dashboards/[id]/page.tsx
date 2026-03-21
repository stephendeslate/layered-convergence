import { Suspense } from 'react';
import { ApiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { createWidget } from '@/app/actions';

const WIDGET_TYPE_LABELS: Record<string, string> = {
  LINE: 'Line Chart',
  BAR: 'Bar Chart',
  PIE: 'Pie Chart',
  METRIC: 'Metric',
  TABLE: 'Table',
};

async function DashboardDetail({ id }: { id: string }) {
  const dashboard = await ApiClient.getDashboard(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{dashboard.name}</h1>
        {dashboard.isPublic && <Badge variant="secondary">Public</Badge>}
      </div>
      {dashboard.description && (
        <p className="text-muted-foreground">{dashboard.description}</p>
      )}

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Add Widget</h2>
        <form action={createWidget} className="space-y-4">
          <input type="hidden" name="dashboardId" value={id} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="widget-title">Title</Label>
              <Input
                id="widget-title"
                name="title"
                required
                placeholder="Revenue Over Time"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-type">Type</Label>
              <Select id="widget-type" name="type" required>
                <option value="">Select type</option>
                <option value="LINE">Line Chart</option>
                <option value="BAR">Bar Chart</option>
                <option value="PIE">Pie Chart</option>
                <option value="METRIC">Metric</option>
                <option value="TABLE">Table</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="widget-config">Config (JSON)</Label>
              <Input
                id="widget-config"
                name="config"
                placeholder='{"metric": "revenue"}'
              />
            </div>
          </div>
          <Button type="submit">Add Widget</Button>
        </form>
      </div>

      {dashboard.widgets && dashboard.widgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboard.widgets.map((widget) => (
            <Card key={widget.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{widget.title}</CardTitle>
                  <Badge variant="outline">
                    {WIDGET_TYPE_LABELS[widget.type] ?? widget.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                  {WIDGET_TYPE_LABELS[widget.type] ?? widget.type} preview
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">No widgets yet</p>
          <p className="text-sm text-muted-foreground">
            Add widgets to start building your dashboard
          </p>
        </div>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`widget-skeleton-${i}`}
            className="h-48 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}

export default async function DashboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <DashboardDetail id={id} />
    </Suspense>
  );
}
