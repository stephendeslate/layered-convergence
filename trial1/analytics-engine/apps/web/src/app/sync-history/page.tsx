'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { apiClient } from '@/lib/api-client';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import type { SyncRun, DeadLetterEvent } from '@analytics-engine/shared';

export default function SyncHistoryPage() {
  const [syncRuns, setSyncRuns] = useState<SyncRun[]>([]);
  const [deadLetters, setDeadLetters] = useState<DeadLetterEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [srRes, dlRes] = await Promise.all([
          apiClient.get<SyncRun[]>('/sync-runs?limit=50'),
          apiClient.get<DeadLetterEvent[]>('/dead-letter-events?limit=50'),
        ]);
        setSyncRuns(srRes.data);
        setDeadLetters(dlRes.data);
      } catch {
        // error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sync History</h1>
        <p className="mt-1 text-sm text-gray-500">
          View data synchronization runs and dead letter events.
        </p>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <Tabs defaultValue="runs">
          <TabsList>
            <TabsTrigger value="runs">
              Sync Runs ({syncRuns.length})
            </TabsTrigger>
            <TabsTrigger value="dead-letters">
              Dead Letter Events ({deadLetters.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="runs">
            <Card>
              <CardContent className="p-0">
                {syncRuns.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No sync runs recorded yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Source</TableHead>
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
                          <TableCell className="font-mono text-xs">{sr.dataSourceId.slice(0, 8)}...</TableCell>
                          <TableCell>{sr.rowsSynced.toLocaleString()}</TableCell>
                          <TableCell>
                            {sr.rowsFailed > 0 ? (
                              <span className="text-red-600">{sr.rowsFailed.toLocaleString()}</span>
                            ) : (
                              '0'
                            )}
                          </TableCell>
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

          <TabsContent value="dead-letters">
            <Card>
              <CardContent className="p-0">
                {deadLetters.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    No dead letter events. Failed ingestion rows will appear here.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Created</TableHead>
                        <TableHead>Data Source</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead>Payload Preview</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deadLetters.map((dl) => (
                        <TableRow key={dl.id}>
                          <TableCell className="text-xs">
                            {formatDateTime(dl.createdAt)}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {dl.dataSourceId.slice(0, 8)}...
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate text-xs text-red-600">
                            {dl.errorMessage}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate font-mono text-xs text-gray-500">
                            {JSON.stringify(dl.payload).slice(0, 80)}...
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}
