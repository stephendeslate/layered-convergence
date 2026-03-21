import { Suspense } from 'react';
import { ApiClient } from '@/lib/api';
import { DataSourceCard } from '@/components/dashboard/data-source-card';
import { Button } from '@/components/ui/button';
import { createDataSource } from '@/app/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

async function DataSourceList() {
  const dataSources = await ApiClient.getDataSources();

  if (dataSources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg text-muted-foreground">
          No data sources configured yet
        </p>
        <p className="text-sm text-muted-foreground">
          Create your first data source to start ingesting data
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dataSources.map((ds) => (
        <a key={ds.id} href={`/data-sources/${ds.id}`}>
          <DataSourceCard dataSource={ds} />
        </a>
      ))}
    </div>
  );
}

function DataSourceListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={`ds-skeleton-${i}`}
          className="h-48 animate-pulse rounded-lg border bg-muted"
        />
      ))}
    </div>
  );
}

export default function DataSourcesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
          <p className="text-muted-foreground">
            Manage your data source connections
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Add Data Source</h2>
        <form action={createDataSource} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ds-name">Name</Label>
              <Input id="ds-name" name="name" required placeholder="My Database" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ds-type">Type</Label>
              <Select id="ds-type" name="type" required>
                <option value="">Select type</option>
                <option value="POSTGRESQL">PostgreSQL</option>
                <option value="MYSQL">MySQL</option>
                <option value="CSV">CSV</option>
                <option value="API">API</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ds-host">Host</Label>
              <Input id="ds-host" name="host" placeholder="localhost" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ds-port">Port</Label>
              <Input id="ds-port" name="port" placeholder="5432" />
            </div>
          </div>
          <Button type="submit">Create Data Source</Button>
        </form>
      </div>

      <Suspense fallback={<DataSourceListSkeleton />}>
        <DataSourceList />
      </Suspense>
    </div>
  );
}
