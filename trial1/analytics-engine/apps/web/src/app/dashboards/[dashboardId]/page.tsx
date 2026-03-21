'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { WidgetConfigPanel } from '@/components/widgets/widget-config-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { apiClient } from '@/lib/api-client';
import type { Dashboard, Widget } from '@analytics-engine/shared';
import { DashboardStatus, MAX_WIDGETS_PER_DASHBOARD } from '@analytics-engine/shared';

export default function DashboardBuilderPage() {
  const params = useParams<{ dashboardId: string }>();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Widget | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await apiClient.get<Dashboard>(`/dashboards/${params.dashboardId}?include=widgets,embedConfig`);
      setDashboard(res.data);
    } catch {
      router.push('/dashboards');
    } finally {
      setLoading(false);
    }
  }, [params.dashboardId, router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleStatusChange = async (status: DashboardStatus) => {
    try {
      await apiClient.patch(`/dashboards/${params.dashboardId}/status`, { status });
      fetchDashboard();
    } catch {
      // error
    }
  };

  const handleDeleteWidget = async () => {
    if (!deleteConfirm) return;
    try {
      await apiClient.delete(`/dashboards/${params.dashboardId}/widgets/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchDashboard();
    } catch {
      // error
    }
  };

  const handleDeleteDashboard = async () => {
    try {
      await apiClient.delete(`/dashboards/${params.dashboardId}`);
      router.push('/dashboards');
    } catch {
      // error
    }
  };

  if (loading) {
    return (
      <AppShell>
        <PageLoader />
      </AppShell>
    );
  }

  if (!dashboard) return null;

  const widgets = dashboard.widgets ?? [];
  const canAddWidget = widgets.length < MAX_WIDGETS_PER_DASHBOARD;

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">{dashboard.name}</h1>
            <Badge
              variant={
                dashboard.status === 'PUBLISHED' ? 'success' :
                dashboard.status === 'ARCHIVED' ? 'warning' : 'default'
              }
            >
              {dashboard.status}
            </Badge>
          </div>
          {dashboard.description && (
            <p className="mt-1 text-sm text-gray-500">{dashboard.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {dashboard.status === DashboardStatus.DRAFT && (
            <Button variant="outline" onClick={() => handleStatusChange(DashboardStatus.PUBLISHED)}>
              Publish
            </Button>
          )}
          {dashboard.status === DashboardStatus.PUBLISHED && (
            <>
              <Button variant="outline" onClick={() => handleStatusChange(DashboardStatus.ARCHIVED)}>
                Archive
              </Button>
              <Button variant="outline" onClick={() => handleStatusChange(DashboardStatus.DRAFT)}>
                Revert to Draft
              </Button>
            </>
          )}
          {dashboard.status === DashboardStatus.ARCHIVED && (
            <Button variant="outline" onClick={() => handleStatusChange(DashboardStatus.DRAFT)}>
              Revert to Draft
            </Button>
          )}
          {canAddWidget && (
            <Button
              onClick={() => {
                setSelectedWidget(null);
                setConfigOpen(true);
              }}
            >
              + Add Widget
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main grid area */}
        <div className="flex-1">
          {widgets.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  title="No widgets yet"
                  description="Add your first widget to start building this dashboard."
                  action={
                    <Button onClick={() => { setSelectedWidget(null); setConfigOpen(true); }}>
                      Add Widget
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <DashboardGrid
              widgets={widgets}
              gridColumns={dashboard.gridColumns}
              editable
              onWidgetClick={(w) => {
                setSelectedWidget(w);
                setConfigOpen(true);
              }}
            />
          )}

          {/* Dashboard actions */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="text-xs text-gray-500">
              {widgets.length} / {MAX_WIDGETS_PER_DASHBOARD} widgets used
              &middot; {dashboard.gridColumns} column grid
            </div>
            <div className="flex gap-2">
              {selectedWidget && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm(selectedWidget)}
                >
                  Delete Widget
                </Button>
              )}
              <Button variant="destructive" size="sm" onClick={handleDeleteDashboard}>
                Delete Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Config side panel */}
        {configOpen && (
          <div className="w-80 shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {selectedWidget ? 'Edit Widget' : 'Add Widget'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WidgetConfigPanel
                  dashboardId={params.dashboardId}
                  widget={selectedWidget}
                  onSave={() => {
                    setConfigOpen(false);
                    setSelectedWidget(null);
                    fetchDashboard();
                  }}
                  onCancel={() => {
                    setConfigOpen(false);
                    setSelectedWidget(null);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete widget confirm */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogHeader>
          <DialogTitle>Delete Widget</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">
          Are you sure you want to delete &quot;{deleteConfirm?.title}&quot;? This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeleteWidget}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </AppShell>
  );
}
