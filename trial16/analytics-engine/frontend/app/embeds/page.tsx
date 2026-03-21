import { Suspense } from 'react';
import { ApiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createEmbed } from '@/app/actions';

async function EmbedList() {
  const embeds = await ApiClient.getEmbeds();

  if (embeds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">No embed configurations</p>
        <p className="text-sm text-muted-foreground">
          Create an embed to share dashboards externally
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {embeds.map((embed) => (
        <Card key={embed.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {embed.dashboard?.name ?? 'Dashboard'}
              </CardTitle>
              <Badge variant={embed.isActive ? 'success' : 'secondary'}>
                {embed.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Token</dt>
                <dd className="font-mono text-xs break-all">{embed.token}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Allowed Origins</dt>
                <dd className="font-medium">
                  {embed.allowedOrigins.join(', ')}
                </dd>
              </div>
              {embed.expiresAt && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Expires</dt>
                  <dd className="font-medium">
                    {new Date(embed.expiresAt).toLocaleDateString()}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {new Date(embed.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function DashboardOptions() {
  const dashboards = await ApiClient.getDashboards();

  return (
    <>
      <option value="">Select a dashboard</option>
      {dashboards.map((d) => (
        <option key={d.id} value={d.id}>
          {d.name}
        </option>
      ))}
    </>
  );
}

function EmbedListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={`embed-skeleton-${i}`}
          className="h-48 animate-pulse rounded-lg border bg-muted"
        />
      ))}
    </div>
  );
}

export default function EmbedsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Embed Configurations</h1>
        <p className="text-muted-foreground">
          Manage embeddable dashboard configurations
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Create Embed</h2>
        <form action={createEmbed} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="embed-dashboard">Dashboard</Label>
              <select
                id="embed-dashboard"
                name="dashboardId"
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <Suspense fallback={<option>Loading dashboards...</option>}>
                  <DashboardOptions />
                </Suspense>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="embed-origins">Allowed Origins</Label>
              <Input
                id="embed-origins"
                name="allowedOrigins"
                required
                placeholder="https://example.com, https://app.example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="embed-expires">Expiration Date (optional)</Label>
            <Input
              id="embed-expires"
              name="expiresAt"
              type="datetime-local"
            />
          </div>
          <Button type="submit">Create Embed</Button>
        </form>
      </div>

      <Suspense fallback={<EmbedListSkeleton />}>
        <EmbedList />
      </Suspense>
    </div>
  );
}
