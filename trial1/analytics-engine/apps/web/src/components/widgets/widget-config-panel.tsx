'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import {
  WidgetType,
  AggregationFunction,
  DateRangePreset,
  GroupingPeriod,
} from '@analytics-engine/shared';
import type { DataSource, FieldMapping, Widget } from '@analytics-engine/shared';

interface WidgetConfigPanelProps {
  dashboardId: string;
  widget?: Widget | null;
  onSave: () => void;
  onCancel: () => void;
}

export function WidgetConfigPanel({
  dashboardId,
  widget,
  onSave,
  onCancel,
}: WidgetConfigPanelProps) {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [fields, setFields] = useState<FieldMapping[]>([]);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(widget?.title ?? '');
  const [subtitle, setSubtitle] = useState(widget?.subtitle ?? '');
  const [type, setType] = useState<WidgetType>(widget?.type ?? WidgetType.LINE);
  const [dataSourceId, setDataSourceId] = useState(widget?.dataSourceId ?? '');
  const [dimensionField, setDimensionField] = useState(widget?.dimensionField ?? '');
  const [metricField, setMetricField] = useState(widget?.metricFields?.[0]?.field ?? '');
  const [aggregation, setAggregation] = useState<AggregationFunction>(
    widget?.metricFields?.[0]?.aggregation ?? AggregationFunction.SUM,
  );
  const [dateRange, setDateRange] = useState<DateRangePreset>(
    widget?.dateRangePreset ?? DateRangePreset.LAST_30_DAYS,
  );
  const [grouping, setGrouping] = useState<GroupingPeriod>(
    widget?.groupingPeriod ?? GroupingPeriod.DAILY,
  );
  const [colStart, setColStart] = useState(widget?.gridColumnStart ?? 1);
  const [colSpan, setColSpan] = useState(widget?.gridColumnSpan ?? 6);
  const [rowStart, setRowStart] = useState(widget?.gridRowStart ?? 1);
  const [rowSpan, setRowSpan] = useState(widget?.gridRowSpan ?? 1);

  useEffect(() => {
    apiClient.get<DataSource[]>('/data-sources').then((res) => setDataSources(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (dataSourceId) {
      apiClient
        .get<FieldMapping[]>(`/data-sources/${dataSourceId}/field-mappings`)
        .then((res) => setFields(res.data))
        .catch(() => setFields([]));
    }
  }, [dataSourceId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        title,
        subtitle: subtitle || null,
        type,
        dataSourceId,
        dimensionField,
        metricFields: [{ field: metricField, aggregation }],
        dateRangePreset: dateRange,
        groupingPeriod: grouping,
        gridColumnStart: colStart,
        gridColumnSpan: colSpan,
        gridRowStart: rowStart,
        gridRowSpan: rowSpan,
        typeConfig: {},
        sortOrder: 0,
      };

      if (widget) {
        await apiClient.patch(`/dashboards/${dashboardId}/widgets/${widget.id}`, body);
      } else {
        await apiClient.post(`/dashboards/${dashboardId}/widgets`, body);
      }
      onSave();
    } catch {
      // error state
    } finally {
      setSaving(false);
    }
  };

  const dimensionFields = fields.filter((f) => f.fieldRole === 'DIMENSION');
  const metricFields = fields.filter((f) => f.fieldRole === 'METRIC');

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Widget title" />
      </div>

      <div className="space-y-2">
        <Label>Subtitle (optional)</Label>
        <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Subtitle" />
      </div>

      <div className="space-y-2">
        <Label>Chart Type</Label>
        <Select value={type} onChange={(e) => setType(e.target.value as WidgetType)}>
          {Object.values(WidgetType).map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Data Source</Label>
        <Select value={dataSourceId} onChange={(e) => setDataSourceId(e.target.value)}>
          <option value="">Select data source...</option>
          {dataSources.map((ds) => (
            <option key={ds.id} value={ds.id}>
              {ds.name} ({ds.connectorType})
            </option>
          ))}
        </Select>
      </div>

      {dataSourceId && (
        <>
          <div className="space-y-2">
            <Label>Dimension Field</Label>
            <Select value={dimensionField} onChange={(e) => setDimensionField(e.target.value)}>
              <option value="">Select dimension...</option>
              {dimensionFields.map((f) => (
                <option key={f.id} value={f.targetField}>
                  {f.targetField} ({f.sourceField})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Metric Field</Label>
            <Select value={metricField} onChange={(e) => setMetricField(e.target.value)}>
              <option value="">Select metric...</option>
              {metricFields.map((f) => (
                <option key={f.id} value={f.targetField}>
                  {f.targetField} ({f.sourceField})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Aggregation</Label>
            <Select value={aggregation} onChange={(e) => setAggregation(e.target.value as AggregationFunction)}>
              {Object.values(AggregationFunction).map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRangePreset)}>
            {Object.values(DateRangePreset).map((d) => (
              <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Grouping</Label>
          <Select value={grouping} onChange={(e) => setGrouping(e.target.value as GroupingPeriod)}>
            {Object.values(GroupingPeriod).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Grid Position</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Column Start</Label>
            <Input type="number" min={1} max={24} value={colStart} onChange={(e) => setColStart(+e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Column Span</Label>
            <Input type="number" min={1} max={24} value={colSpan} onChange={(e) => setColSpan(+e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Row Start</Label>
            <Input type="number" min={1} value={rowStart} onChange={(e) => setRowStart(+e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Row Span</Label>
            <Input type="number" min={1} max={12} value={rowSpan} onChange={(e) => setRowSpan(+e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving || !title || !dataSourceId} className="flex-1">
          {saving ? 'Saving...' : widget ? 'Update Widget' : 'Add Widget'}
        </Button>
      </div>
    </div>
  );
}
