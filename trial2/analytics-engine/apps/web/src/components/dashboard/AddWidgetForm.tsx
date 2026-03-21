'use client';

import { useState } from 'react';
import { WidgetType } from '@analytics-engine/shared';
import type { DataSourceSummary } from '@/lib/api';

interface AddWidgetFormProps {
  dataSources: DataSourceSummary[];
  onAdd: (widget: {
    type: WidgetType;
    title: string;
    config: Record<string, unknown>;
    position: { col: number; row: number };
    size: { colSpan: number; rowSpan: number };
    dataSourceId: string;
  }) => void;
  onCancel: () => void;
  nextRow: number;
}

export function AddWidgetForm({ dataSources, onAdd, onCancel, nextRow }: AddWidgetFormProps) {
  const [type, setType] = useState<WidgetType>(WidgetType.LINE);
  const [title, setTitle] = useState('');
  const [dataSourceId, setDataSourceId] = useState(dataSources[0]?.id ?? '');
  const [metric, setMetric] = useState('');
  const [dimension, setDimension] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const config: Record<string, unknown> = {};
    if (type === WidgetType.AREA) {
      config.metrics = [metric];
      config.dimension = dimension;
    } else if (type === WidgetType.TABLE) {
      config.columns = [
        { field: dimension, label: dimension, sortable: true },
        { field: metric, label: metric, sortable: true },
      ];
    } else if (type === WidgetType.KPI) {
      config.metric = metric;
    } else if (type === WidgetType.FUNNEL) {
      config.stages = [{ name: metric, metric }];
    } else {
      config.metric = metric;
      config.dimension = dimension;
    }
    config.dateRange = '30d';

    onAdd({
      type,
      title,
      config,
      position: { col: 0, row: nextRow },
      size: { colSpan: 6, rowSpan: 4 },
      dataSourceId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Add Widget</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Chart Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as WidgetType)}
          className="w-full border border-slate-300 rounded px-3 py-2"
        >
          {Object.values(WidgetType).map((wt) => (
            <option key={wt} value={wt}>
              {wt.charAt(0).toUpperCase() + wt.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2"
          placeholder="Widget title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Data Source</label>
        <select
          value={dataSourceId}
          onChange={(e) => setDataSourceId(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2"
        >
          {dataSources.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name} ({ds.type})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Metric Field</label>
        <input
          type="text"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2"
          placeholder="e.g., revenue"
        />
      </div>

      {type !== WidgetType.KPI && type !== WidgetType.FUNNEL && (
        <div>
          <label className="block text-sm font-medium mb-1">Dimension Field</label>
          <input
            type="text"
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2"
            placeholder="e.g., timestamp"
          />
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Widget
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-slate-300 px-4 py-2 rounded hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
