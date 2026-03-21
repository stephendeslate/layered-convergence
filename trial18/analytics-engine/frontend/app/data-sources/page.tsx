import { Suspense } from 'react';
import Link from 'next/link';
import { fetchDataSources } from '@/lib/api';
import { DataSourceCard } from '@/components/dashboard/data-source-card';

async function DataSourceList() {
  const dataSources = await fetchDataSources();

  if (dataSources.length === 0) {
    return <p className="text-muted-foreground">No data sources configured.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {dataSources.map((ds) => (
        <Link key={ds.id} href={`/data-sources/${ds.id}`}>
          <DataSourceCard dataSource={ds} />
        </Link>
      ))}
    </div>
  );
}

export default function DataSourcesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Data Sources</h1>
      <Suspense fallback={<div aria-busy="true">Loading data sources...</div>}>
        <DataSourceList />
      </Suspense>
    </div>
  );
}
