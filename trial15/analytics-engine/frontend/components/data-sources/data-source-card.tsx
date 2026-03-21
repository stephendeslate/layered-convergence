import Link from "next/link";
import type { DataSource, DataSourceStatus } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DataSourceCardProps {
  dataSource: DataSource;
}

const statusVariantMap: Record<DataSourceStatus, BadgeVariant> = {
  connected: "success",
  disconnected: "secondary",
  syncing: "warning",
  error: "destructive",
};

const statusLabelMap: Record<DataSourceStatus, string> = {
  connected: "Connected",
  disconnected: "Disconnected",
  syncing: "Syncing",
  error: "Error",
};

function DataSourceCard({ dataSource }: DataSourceCardProps) {
  const statusVariant = statusVariantMap[dataSource.status];
  const statusLabel = statusLabelMap[dataSource.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{dataSource.name}</CardTitle>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="font-medium">{dataSource.type}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Last Sync</dt>
            <dd className="font-medium">
              {dataSource.lastSyncAt
                ? new Date(dataSource.lastSyncAt).toLocaleString()
                : "Never"}
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
      <CardFooter>
        <Link href={`/data-sources/${dataSource.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export { DataSourceCard, type DataSourceCardProps };
