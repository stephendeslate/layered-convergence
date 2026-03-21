import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DataSource } from '@/lib/types';

interface DataSourceCardProps {
  dataSource: DataSource;
}

export function DataSourceCard({ dataSource }: DataSourceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{dataSource.name}</CardTitle>
          <Badge variant="outline">{dataSource.type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Status: {dataSource.status}</p>
        <p className="text-sm text-muted-foreground">Sync: {dataSource.syncFrequency}</p>
        {dataSource.lastSyncAt && (
          <p className="text-xs text-muted-foreground">Last sync: {new Date(dataSource.lastSyncAt).toLocaleString()}</p>
        )}
      </CardContent>
    </Card>
  );
}
