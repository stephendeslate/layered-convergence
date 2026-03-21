'use client';

import { useState } from 'react';
import { ConnectorType } from '@analytics-engine/shared';
import { api } from '@/lib/api';
import type { DataSourceSummary } from '@/lib/api';

interface ConnectorFormProps {
  token: string;
  onCreated: (ds: DataSourceSummary) => void;
  onCancel: () => void;
}

const CONNECTOR_FIELDS: Record<string, Array<{ key: string; label: string; type: string; placeholder: string }>> = {
  [ConnectorType.REST_API]: [
    { key: 'url', label: 'API URL', type: 'text', placeholder: 'https://api.example.com/data' },
    { key: 'method', label: 'HTTP Method', type: 'text', placeholder: 'GET' },
    { key: 'headers', label: 'Headers (JSON)', type: 'text', placeholder: '{"Authorization": "Bearer ..."}' },
    { key: 'responsePath', label: 'Response Path', type: 'text', placeholder: 'data.results' },
  ],
  [ConnectorType.POSTGRESQL]: [
    { key: 'connectionString', label: 'Connection String', type: 'text', placeholder: 'postgresql://user:pass@host:5432/db' },
    { key: 'query', label: 'SQL Query', type: 'text', placeholder: 'SELECT * FROM orders WHERE created_at > $1' },
  ],
  [ConnectorType.CSV]: [
    { key: 'url', label: 'CSV URL', type: 'text', placeholder: 'https://example.com/data.csv' },
    { key: 'delimiter', label: 'Delimiter', type: 'text', placeholder: ',' },
  ],
  [ConnectorType.WEBHOOK]: [
    { key: 'secret', label: 'Webhook Secret', type: 'text', placeholder: 'webhook-secret-key' },
  ],
};

export function ConnectorForm({ token, onCreated, onCancel }: ConnectorFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ConnectorType>(ConnectorType.REST_API);
  const [connConfig, setConnConfig] = useState<Record<string, string>>({});
  const [syncSchedule, setSyncSchedule] = useState('');
  const [fieldMappings, setFieldMappings] = useState<Array<{ sourceField: string; targetField: string; type: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfigChange = (key: string, value: string) => {
    setConnConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addFieldMapping = () => {
    setFieldMappings((prev) => [...prev, { sourceField: '', targetField: '', type: 'dimension' }]);
  };

  const updateFieldMapping = (index: number, field: string, value: string) => {
    setFieldMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    );
  };

  const removeFieldMapping = (index: number) => {
    setFieldMappings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const connectionConfig: Record<string, unknown> = { ...connConfig };
      if (connConfig.headers) {
        try {
          connectionConfig.headers = JSON.parse(connConfig.headers);
        } catch {
          setError('Invalid JSON for headers');
          setSubmitting(false);
          return;
        }
      }

      const config: Record<string, unknown> = {
        connectionConfig,
      };

      if (fieldMappings.length > 0) {
        config.fieldMapping = fieldMappings.map((m) => ({
          sourceField: m.sourceField,
          targetField: m.targetField,
          type: m.type,
          dataType: m.type === 'metric' ? 'number' : 'string',
        }));
      }

      if (syncSchedule.trim()) {
        config.syncSchedule = syncSchedule.trim();
      }

      const result = await api.dataSources.create(token, { name, type, config });
      onCreated({
        id: result.id,
        name: result.name,
        type: result.type,
        isActive: result.isActive,
        lastSyncStatus: null,
        lastSyncAt: null,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data source');
    } finally {
      setSubmitting(false);
    }
  };

  const fields = CONNECTOR_FIELDS[type] ?? [];

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Add Data Source</h3>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2"
          placeholder="My Data Source"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Connector Type</label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as ConnectorType);
            setConnConfig({});
          }}
          className="w-full border border-slate-300 rounded px-3 py-2"
        >
          {Object.values(ConnectorType).map((ct) => (
            <option key={ct} value={ct}>
              {ct.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="border border-slate-200 rounded p-4 space-y-3">
        <legend className="text-sm font-medium px-2">Connection Settings</legend>
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input
              type={f.type}
              value={connConfig[f.key] ?? ''}
              onChange={(e) => handleConfigChange(f.key, e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2"
              placeholder={f.placeholder}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className="border border-slate-200 rounded p-4 space-y-3">
        <legend className="text-sm font-medium px-2">Field Mappings</legend>
        {fieldMappings.map((m, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs mb-1">Source Field</label>
              <input
                type="text"
                value={m.sourceField}
                onChange={(e) => updateFieldMapping(i, 'sourceField', e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                placeholder="api_field_name"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">Target Field</label>
              <input
                type="text"
                value={m.targetField}
                onChange={(e) => updateFieldMapping(i, 'targetField', e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                placeholder="display_name"
              />
            </div>
            <div className="w-28">
              <label className="block text-xs mb-1">Type</label>
              <select
                value={m.type}
                onChange={(e) => updateFieldMapping(i, 'type', e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
              >
                <option value="dimension">Dimension</option>
                <option value="metric">Metric</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => removeFieldMapping(i)}
              className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addFieldMapping}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + Add Field Mapping
        </button>
      </fieldset>

      <div>
        <label className="block text-sm font-medium mb-1">Sync Schedule (cron)</label>
        <input
          type="text"
          value={syncSchedule}
          onChange={(e) => setSyncSchedule(e.target.value)}
          className="w-full border border-slate-300 rounded px-3 py-2"
          placeholder="0 */6 * * * (every 6 hours)"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Create Data Source'}
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
