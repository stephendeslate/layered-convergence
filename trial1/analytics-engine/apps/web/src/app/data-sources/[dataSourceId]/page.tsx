'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api-client';
import { formatDateTime, getConnectorLabel, getStatusColor } from '@/lib/utils';
import type { DataSource, FieldMapping, SyncRun } from '@analytics-engine/shared';
import { SyncSchedule } from '@analytics-engine/shared';

export default function DataSourceDetailPage() {
  const params = useParams<{ dataSourceId: string }>();
  const router = useRouter();
  const [dataSource, setDataSource] = useState<DataSource | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [dsRes, fmRes, srRes] = await Promise.all([
        apiClient.get<DataSource>(`/data-sources/${params.dataSourceId}`),
        apiClient.get<FieldMapping[]>(`/data-sources/${params.dataSourceId}/field-mappings`),
        apiClient.get<SyncRun[]>(`/sync-runs?dataSourceId=${params.dataSourceId}&limit=20`),
      ]);
      setDataSource(dsRes.data);
      setFieldMappings(fmRes.data);
      setSyncRuns(srRes.data);
    } catch {
      router.push('/data-sources');
    } finally {
      setLoading(false);
    }
  }, [params.dataSourceId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post(`/data-sources/${params.dataSourceId}/sync`);
      // Refresh after a short delay to show running status
      setTimeout(fetchData, 1000);
    } catch {
      // error
    } finally {
      setSyncing(false);
    }
  };

  const handleTogglePause = async () => {
    try {
      if (dataSource?.syncPaused) {
        await apiClient.post(`/data-sources/${params.dataSourceId}/resume`);
      } else {
        await apiClient.post(`/data-sources/${params.dataSourceId}/pause`);
      }
      fetchData();
    } catch {
      // error
    }
  };

  const handleUpdateSchedule = async (schedule: SyncSchedule) => {
    try {
      await apiClient.patch(`/data-sources/${params.dataSourceId}`, { syncSchedule: schedule });
      fetchData();
    } catch {
      // error
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`/data-sources/${params.dataSourceId}`);
      router.push('/data-sources');
    } catch {
      // error
    }
  };

  if (loading || !dataSource) {
    return (
      <AppShell>
        <PageLoader />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{dataSource.name}</h1>
            {dataSource.syncPaused && <Badge variant="warning">Paused</Badge>}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {getConnectorLabel(dataSource.connectorType)} &middot; {dataSource.syncSchedule.replace(/_/g, ' ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleTogglePause}>
            {dataSource.syncPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button onClick={handleTriggerSync} disabled={syncing || dataSource.syncPaused}>
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {dataSource.syncPaused ? 'Paused' : 'Active'}
                </p>
                {dataSource.consecutiveFails > 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    {dataSource.consecutiveFails} consecutive failures
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">Last Sync</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {dataSource.lastSyncAt ? formatDateTime(dataSource.lastSyncAt) : 'Never'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">Field Mappings</p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {fieldMappings.length} fields
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mappings">
          <Card>
            <CardHeader>
              <CardTitle>Field Mappings</CardTitle>
              <CardDescription>
                Maps source fields from your data to internal analytics dimensions and metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fieldMappings.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  No field mappings configured. Edit the data source to add mappings.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source Field</TableHead>
                      <TableHead>Target Field</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fieldMappings.map((fm) => (
                      <TableRow key={fm.id}>
                        <TableCell className="font-mono text-xs">{fm.sourceField}</TableCell>
                        <TableCell className="font-mono text-xs">{fm.targetField}</TableCell>
                        <TableCell>
                          <Badge>{fm.fieldType}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={fm.fieldRole === 'METRIC' ? 'info' : 'default'}>
                            {fm.fieldRole}
                          </Badge>
                        </TableCell>
                        <TableCell>{fm.isRequired ? 'Yes' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent data synchronization runs.</CardDescription>
            </CardHeader>
            <CardContent>
              {syncRuns.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  No sync runs yet. Trigger a sync to see history here.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Rows Synced</TableHead>
                      <TableHead>Rows Failed</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncRuns.map((sr) => (
                      <TableRow key={sr.id}>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(sr.status)}`}>
                            {sr.status}
                          </span>
                        </TableCell>
                        <TableCell>{sr.rowsSynced.toLocaleString()}</TableCell>
                        <TableCell>{sr.rowsFailed.toLocaleString()}</TableCell>
                        <TableCell className="text-xs">
                          {sr.startedAt ? formatDateTime(sr.startedAt) : '-'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {sr.completedAt ? formatDateTime(sr.completedAt) : '-'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-red-600">
                          {sr.errorMessage ?? '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="max-w-lg space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sync Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Schedule</Label>
                  <Select
                    value={dataSource.syncSchedule}
                    onChange={(e) => handleUpdateSchedule(e.target.value as SyncSchedule)}
                  >
                    {Object.values(SyncSchedule).map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-gray-500">
                  Deleting this data source will remove all associated data points, field mappings,
                  and sync history. This action cannot be undone.
                </p>
                <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                  Delete Data Source
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogHeader>
          <DialogTitle>Delete Data Source</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          Are you sure you want to delete &quot;{dataSource.name}&quot;? This will permanently
          remove all ingested data and sync history.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </AppShell>
  );
}
