import type { DataSource } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_VARIANTS: Record<string, 'success' | 'destructive' | 'warning'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  ERROR: 'destructive',
};

const TYPE_LABELS: Record<string, string> = {
  POSTGRESQL: 'PostgreSQL',
  MYSQL: 'MySQL',
  CSV: 'CSV',
  API: 'API',
};

interface DataSourceCardProps {
  dataSource: DataSource;
}

export function DataSourceCard({ dataSource }: DataSourceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{dataSource.name}</CardTitle>
          <Badge variant={STATUS_VARIANTS[dataSource.status] ?? 'outline'}>
            {dataSource.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="font-medium">
              {TYPE_LABELS[dataSource.type] ?? dataSource.type}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Last Synced</dt>
            <dd className="font-medium">
              {dataSource.lastSyncAt
                ? new Date(dataSource.lastSyncAt).toLocaleDateString()
                : 'Never'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Created</dt>
            <dd className="font-medium">
              {new Date(dataSource.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
