'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import { ConnectorType, SyncSchedule } from '@analytics-engine/shared';

type Step = 'type' | 'config' | 'mapping' | 'review';

const connectorOptions = [
  {
    type: ConnectorType.REST_API,
    label: 'REST API',
    description: 'Poll an external API endpoint on a schedule',
  },
  {
    type: ConnectorType.POSTGRESQL,
    label: 'PostgreSQL',
    description: 'Read data from a PostgreSQL database',
  },
  {
    type: ConnectorType.CSV,
    label: 'CSV Upload',
    description: 'Upload a CSV file to import data',
  },
  {
    type: ConnectorType.WEBHOOK,
    label: 'Webhook',
    description: 'Receive real-time events via HTTP POST',
  },
];

export default function NewDataSourcePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('type');
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [connectorType, setConnectorType] = useState<ConnectorType>(ConnectorType.REST_API);
  const [syncSchedule, setSyncSchedule] = useState<SyncSchedule>(SyncSchedule.MANUAL);

  // Connector config (JSON)
  const [configJson, setConfigJson] = useState('{}');

  // Field mappings
  const [mappings, setMappings] = useState<
    Array<{ sourceField: string; targetField: string; fieldType: string; fieldRole: string }>
  >([{ sourceField: '', targetField: '', fieldType: 'STRING', fieldRole: 'DIMENSION' }]);

  const addMapping = () => {
    setMappings([...mappings, { sourceField: '', targetField: '', fieldType: 'STRING', fieldRole: 'DIMENSION' }]);
  };

  const updateMapping = (index: number, field: string, value: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], [field]: value };
    setMappings(updated);
  };

  const removeMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      // Create data source
      const dsRes = await apiClient.post<{ id: string }>('/data-sources', {
        name,
        connectorType,
        syncSchedule,
      });
      const dataSourceId = dsRes.data.id;

      // Save config
      try {
        const config = JSON.parse(configJson);
        await apiClient.put(`/data-sources/${dataSourceId}/config`, {
          connectionConfig: config,
          transformSteps: [],
        });
      } catch {
        // Config save failed, but data source is created
      }

      // Save field mappings
      const validMappings = mappings.filter((m) => m.sourceField && m.targetField);
      if (validMappings.length > 0) {
        await apiClient.put(`/data-sources/${dataSourceId}/field-mappings`, {
          fieldMappings: validMappings.map((m, i) => ({
            sourceField: m.sourceField,
            targetField: m.targetField,
            fieldType: m.fieldType,
            fieldRole: m.fieldRole,
            isRequired: false,
            isPii: false,
            sortOrder: i,
          })),
        });
      }

      router.push(`/data-sources/${dataSourceId}`);
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New Data Source</h1>
        <p className="mt-1 text-sm text-gray-500">
          Connect an external data source to start ingesting analytics data.
        </p>
      </div>

      {/* Step indicators */}
      <div className="mb-8 flex items-center gap-2">
        {(['type', 'config', 'mapping', 'review'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                step === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {i + 1}
            </button>
            <span className={`text-sm ${step === s ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
            {i < 3 && <div className="mx-2 h-px w-8 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select type */}
      {step === 'type' && (
        <div className="max-w-2xl space-y-4">
          <div className="space-y-2">
            <Label>Data Source Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production API, Analytics DB"
            />
          </div>

          <div className="space-y-2">
            <Label>Connector Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {connectorOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setConnectorType(opt.type)}
                  className={`rounded-lg border-2 p-4 text-left transition-colors ${
                    connectorType === opt.type
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-gray-900">{opt.label}</p>
                  <p className="mt-1 text-xs text-gray-500">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sync Schedule</Label>
            <Select value={syncSchedule} onChange={(e) => setSyncSchedule(e.target.value as SyncSchedule)}>
              {Object.values(SyncSchedule).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </Select>
          </div>

          <div className="pt-4">
            <Button onClick={() => setStep('config')} disabled={!name.trim()}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Connection config */}
      {step === 'config' && (
        <div className="max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Configuration</CardTitle>
              <CardDescription>
                {connectorType === ConnectorType.REST_API &&
                  'Configure the API endpoint URL, headers, and authentication.'}
                {connectorType === ConnectorType.POSTGRESQL &&
                  'Provide the connection string and query for data extraction.'}
                {connectorType === ConnectorType.CSV &&
                  'No connection configuration needed for CSV. Upload files after creation.'}
                {connectorType === ConnectorType.WEBHOOK &&
                  'A unique webhook URL will be generated after creation.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectorType === ConnectorType.REST_API && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Configuration JSON</Label>
                    <Textarea
                      rows={8}
                      value={configJson}
                      onChange={(e) => setConfigJson(e.target.value)}
                      placeholder={JSON.stringify(
                        {
                          url: 'https://api.example.com/data',
                          method: 'GET',
                          headers: { Authorization: 'Bearer xxx' },
                          responsePath: '$.data',
                        },
                        null,
                        2,
                      )}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}
              {connectorType === ConnectorType.POSTGRESQL && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Configuration JSON</Label>
                    <Textarea
                      rows={8}
                      value={configJson}
                      onChange={(e) => setConfigJson(e.target.value)}
                      placeholder={JSON.stringify(
                        {
                          connectionString: 'postgresql://user:pass@host:5432/db',
                          query: 'SELECT * FROM analytics_events WHERE created_at > $1',
                        },
                        null,
                        2,
                      )}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              )}
              {connectorType === ConnectorType.CSV && (
                <p className="text-sm text-gray-500">
                  CSV connector does not require connection configuration. You can upload CSV files
                  after creating the data source.
                </p>
              )}
              {connectorType === ConnectorType.WEBHOOK && (
                <p className="text-sm text-gray-500">
                  A unique webhook ingest URL will be generated automatically. You can POST events
                  to this URL after creating the data source.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep('type')}>Back</Button>
            <Button onClick={() => setStep('mapping')}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step 3: Field mapping */}
      {step === 'mapping' && (
        <div className="max-w-3xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping</CardTitle>
              <CardDescription>
                Map source fields to internal dimension and metric fields.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2 text-xs font-medium text-gray-500">
                  <span>Source Field</span>
                  <span>Target Field</span>
                  <span>Type</span>
                  <span>Role</span>
                  <span />
                </div>
                {mappings.map((m, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2">
                    <Input
                      value={m.sourceField}
                      onChange={(e) => updateMapping(i, 'sourceField', e.target.value)}
                      placeholder="created_at"
                      className="text-xs"
                    />
                    <Input
                      value={m.targetField}
                      onChange={(e) => updateMapping(i, 'targetField', e.target.value)}
                      placeholder="date"
                      className="text-xs"
                    />
                    <Select
                      value={m.fieldType}
                      onChange={(e) => updateMapping(i, 'fieldType', e.target.value)}
                      className="text-xs"
                    >
                      <option value="STRING">String</option>
                      <option value="NUMBER">Number</option>
                      <option value="DATE">Date</option>
                      <option value="BOOLEAN">Boolean</option>
                    </Select>
                    <Select
                      value={m.fieldRole}
                      onChange={(e) => updateMapping(i, 'fieldRole', e.target.value)}
                      className="text-xs"
                    >
                      <option value="DIMENSION">Dimension</option>
                      <option value="METRIC">Metric</option>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMapping(i)}
                      disabled={mappings.length <= 1}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addMapping}>
                  + Add Field
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep('config')}>Back</Button>
            <Button onClick={() => setStep('review')}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 'review' && (
        <div className="max-w-2xl space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review</CardTitle>
              <CardDescription>Review your data source configuration before creating.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Connector Type</p>
                <p className="text-sm font-medium text-gray-900">{connectorType.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Sync Schedule</p>
                <p className="text-sm font-medium text-gray-900">{syncSchedule.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Field Mappings</p>
                <p className="text-sm text-gray-900">
                  {mappings.filter((m) => m.sourceField).length} field(s) configured
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep('mapping')}>Back</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Data Source'}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
