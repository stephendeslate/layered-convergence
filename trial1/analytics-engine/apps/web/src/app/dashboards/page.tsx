'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PageLoader } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { apiClient } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import type { Dashboard } from '@analytics-engine/shared';

export default function DashboardsPageWrapper() {
  return (
    <Suspense fallback={<AppShell><PageLoader /></AppShell>}>
      <DashboardsPage />
    </Suspense>
  );
}

function DashboardsPage() {
  const searchParams = useSearchParams();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(searchParams.get('create') === 'true');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchDashboards = async () => {
    try {
      const res = await apiClient.get<Dashboard[]>('/dashboards');
      setDashboards(res.data);
    } catch {
      // empty state shown
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiClient.post('/dashboards', {
        name: newName,
        description: newDesc || null,
        gridColumns: 12,
      });
      setCreateOpen(false);
      setNewName('');
      setNewDesc('');
      fetchDashboards();
    } catch {
      // error handled silently
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your analytics dashboards.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New Dashboard</Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : dashboards.length === 0 ? (
        <EmptyState
          title="No dashboards yet"
          description="Create your first dashboard to start building analytics."
          action={
            <Button onClick={() => setCreateOpen(true)}>Create Dashboard</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((d) => (
            <Link key={d.id} href={`/dashboards/${d.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{d.name}</h3>
                      {d.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{d.description}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        d.status === 'PUBLISHED' ? 'success' :
                        d.status === 'ARCHIVED' ? 'warning' : 'default'
                      }
                    >
                      {d.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    <span>{d.widgets?.length ?? 0} widgets</span>
                    <span>{d.gridColumns} columns</span>
                    <span>Created {formatDate(d.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>New Dashboard</DialogTitle>
            <DialogDescription>Create a new analytics dashboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dash-name">Name</Label>
              <Input
                id="dash-name"
                placeholder="My Dashboard"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dash-desc">Description (optional)</Label>
              <Input
                id="dash-desc"
                placeholder="A brief description..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || !newName.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </AppShell>
  );
}
