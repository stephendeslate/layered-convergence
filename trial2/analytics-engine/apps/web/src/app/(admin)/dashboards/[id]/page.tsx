'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import type { DashboardDetail, Widget, DataSourceSummary } from '@/lib/api';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AddWidgetForm } from '@/components/dashboard/AddWidgetForm';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardDetail | null>(null);
  const [dataSources, setDataSources] = useState<DataSourceSummary[]>([]);
  const [widgetData, setWidgetData] = useState<Map<string, Record<string, unknown>[]>>(new Map());
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWidgetData = useCallback(async (widgets: Widget[]) => {
    if (!token) return;
    const dataMap = new Map<string, Record<string, unknown>[]>();

    await Promise.allSettled(
      widgets.map(async (w) => {
        if (!w.dataSourceId) return;
        try {
          const config = w.config;
          const metrics = Array.isArray(config.metrics)
            ? (config.metrics as string[])
            : config.metric
              ? [config.metric as string]
              : [];

          const dimensions = config.dimension ? [config.dimension as string] : [];

          const result = await api.query.execute(token, {
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
  }, [token]);

  useEffect(() => {
    if (!token || !id) return;
    Promise.all([
      api.dashboards.get(token, id),
      api.dataSources.list(token),
    ]).then(([dash, dsResult]) => {
      setDashboard(dash);
      setDataSources(dsResult.data);
      setLoading(false);
      fetchWidgetData(dash.widgets);
    }).catch(() => setLoading(false));
  }, [token, id, fetchWidgetData]);

  const handleAddWidget = async (widgetData: {
    type: string;
    title: string;
    config: Record<string, unknown>;
    position: { col: number; row: number };
    size: { colSpan: number; rowSpan: number };
    dataSourceId: string;
  }) => {
    if (!token || !dashboard) return;
    const created = await api.widgets.create(token, dashboard.id, widgetData);
    const updatedDashboard = { ...dashboard, widgets: [...dashboard.widgets, created] };
    setDashboard(updatedDashboard);
    setShowAddForm(false);
    fetchWidgetData(updatedDashboard.widgets);
  };

  const handleRemoveWidget = async (widgetId: string) => {
    if (!token || !dashboard) return;
    await api.widgets.delete(token, dashboard.id, widgetId);
    setDashboard({
      ...dashboard,
      widgets: dashboard.widgets.filter((w) => w.id !== widgetId),
    });
  };

  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>;
  }

  if (!dashboard) {
    return <p className="text-red-500">Dashboard not found.</p>;
  }

  const maxRow = dashboard.widgets.reduce(
    (max, w) => Math.max(max, (w.position.row ?? 0) + (w.size.rowSpan ?? 4)),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{dashboard.name}</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Widget
        </button>
      </div>

      {showAddForm && (
        <AddWidgetForm
          dataSources={dataSources}
          onAdd={handleAddWidget}
          onCancel={() => setShowAddForm(false)}
          nextRow={maxRow}
        />
      )}

      {dashboard.widgets.length === 0 ? (
        <p className="text-slate-500">No widgets yet. Click &quot;Add Widget&quot; to get started.</p>
      ) : (
        <DashboardGrid
          widgets={dashboard.widgets}
          widgetData={widgetData}
          onRemoveWidget={handleRemoveWidget}
          editable
        />
      )}
    </div>
  );
}
