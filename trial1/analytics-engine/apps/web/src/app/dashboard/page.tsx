'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { formatDateTime, getStatusColor } from '@/lib/utils';
import type { Dashboard, DataSource, SyncRun } from '@analytics-engine/shared';

interface OverviewData {
  dashboards: Dashboard[];
  dataSources: DataSource[];
  recentSyncs: SyncRun[];
}

export default function DashboardOverviewPage() {
  const { tenant } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashRes, dsRes, syncRes] = await Promise.all([
          apiClient.get<Dashboard[]>('/dashboards'),
          apiClient.get<DataSource[]>('/data-sources'),
          apiClient.get<SyncRun[]>('/sync-runs?limit=10'),
        ]);
        setData({
          dashboards: dashRes.data,
          dataSources: dsRes.data,
          recentSyncs: syncRes.data,
        });
      } catch {
        // Silently fail — page shows empty states
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {tenant?.name}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s an overview of your analytics platform.
        </p>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Data Sources</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {data?.dataSources.length ?? 0}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dashboards</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {data?.dashboards.length ?? 0}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                    <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Recent Syncs (24h)</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">
                      {data?.recentSyncs.length ?? 0}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                    <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent dashboards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Dashboards</CardTitle>
                <Link href="/dashboards">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {!data?.dashboards.length ? (
                  <p className="py-4 text-center text-sm text-gray-500">
                    No dashboards yet.{' '}
                    <Link href="/dashboards?create=true" className="font-medium text-gray-900 hover:underline">
                      Create one
                    </Link>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.dashboards.slice(0, 5).map((d) => (
                      <Link
                        key={d.id}
                        href={`/dashboards/${d.id}`}
                        className="flex items-center justify-between rounded-md border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{d.name}</p>
                          <p className="text-xs text-gray-500">
                            {d.widgets?.length ?? 0} widgets
                          </p>
                        </div>
                        <Badge
                          variant={
                            d.status === 'PUBLISHED' ? 'success' :
                            d.status === 'ARCHIVED' ? 'warning' : 'default'
                          }
                        >
                          {d.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Sync Runs</CardTitle>
                <Link href="/sync-history">
                  <Button variant="ghost" size="sm">View all</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {!data?.recentSyncs.length ? (
                  <p className="py-4 text-center text-sm text-gray-500">
                    No sync runs yet. Configure a data source to start syncing.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.recentSyncs.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-md border border-gray-100 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {s.rowsSynced} rows synced
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.startedAt ? formatDateTime(s.startedAt) : 'Pending'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(s.status)}`}
                        >
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}
